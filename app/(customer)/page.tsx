'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, ShoppingCart, Loader2 } from 'lucide-react'
import MenuCard, { MenuItem } from '@/components/customer/MenuCard'
import CartSidebar, { CartItem } from '@/components/customer/CartSidebar'
import QrisModal from '@/components/customer/QrisModal'
import { useRouter } from 'next/navigation'

export default function CustomerLandingPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>(['Semua'])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)

  // State Keranjang & Checkout
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'KASIR'>('QRIS')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State Form Pemesan
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN')
  const [tableNumber, setTableNumber] = useState('Meja T-01')
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false)

  // 1. Fetch Data Menu & Kategori dari Database MySQL
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoadingMenu(true)
        const res = await fetch('/api/menu')
        if (!res.ok) throw new Error('Gagal mengambil menu')
        
        const data = await res.json()

        // Flatten data kategori -> items untuk dikonsumsi oleh UI
        const allMenus: MenuItem[] = []
        const categoryList: string[] = ['Semua']

        data.forEach((cat: any) => {
          if (cat.name) categoryList.push(cat.name)
          if (cat.menus && Array.isArray(cat.menus)) {
            cat.menus.forEach((menu: any) => {
              allMenus.push({
                id: menu.id,
                name: menu.name,
                category: cat.name,
                description: menu.description || 'Menu pilihan dari Dapur Dayun Nasgor.',
                price: menu.price,
                image: menu.imageUrl || menu.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
                isBestSeller: menu.isBestSeller,
                isAvailable: menu.isAvailable ?? true, // <-- FIX UTAMA: Pass properti isAvailable ke objek MenuItem!
              })
            })
          }
        })

        setCategories(Array.from(new Set(categoryList)))
        setMenuItems(allMenus)
      } catch (err) {
        console.error('Error fetching menu:', err)
      } finally {
        setIsLoadingMenu(false)
      }
    }

    fetchMenuData()
  }, [])

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...item, qty: 1, note: '' }]
    })
  }

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const handleUpdateNote = (id: string, noteText: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: noteText } : item))
    )
  }

  // 2. Fungsi Kirim Pesanan ke Database MySQL
  const processCreateOrder = async (payMethod: 'QRIS' | 'TUNAI_KASIR') => {
    try {
      setIsSubmitting(true)

      const payload = {
        customerName: customerName.trim(),
        orderType: orderType === 'TAKEAWAY' ? 'TAKE_AWAY' : 'DINE_IN',
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        paymentMethod: payMethod, // Pasikan nilai yang terkirim ke Prisma sesuai Enum schema
        items: cart.map((item) => ({
          menuId: item.id,
          quantity: item.qty,
          note: item.note || '',
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Gagal membuat pesanan')
      }

      return data.order
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Handler tombol "Pesan Sekarang"
  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      alert('Mohon isi Nama Pemesan terlebih dahulu!')
      return
    }

    if (cart.length === 0) {
      alert('Keranjang belanjaan Anda masih kosong!')
      return
    }

    // Jika user memilih tab QRIS
    if (paymentMethod === 'QRIS') {
      setIsQrisModalOpen(true)
    } else {
      // Jika user memilih tab BAYAR DI KASIR
      const createdOrder = await processCreateOrder('TUNAI_KASIR')
      if (createdOrder) {
        setCart([])
        setCustomerName('')
        setIsCartOpen(false)
        // Redirect ke Live Tracker Status Page
        router.push(`/order/${createdOrder.id}`)
      }
    }
  }

  // 3. Handler saat Modal QRIS berhasil diklik "Sudah Bayar"
  const handleQrisSuccessPay = async () => {
    const createdOrder = await processCreateOrder('QRIS')
    if (createdOrder) {
      setCart([])
      setCustomerName('')
      setIsCartOpen(false)
      setIsQrisModalOpen(false)
      // Redirect ke Live Tracker Status Page
      router.push(`/order/${createdOrder.id}`)
    }
  }

  const filteredMenu = menuItems.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF9]">
      
      {/* 1. LEFT BRAND SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#7A1517] text-white flex-col items-center justify-between p-8 shrink-0 h-screen">
        <div className="flex flex-col items-center text-center mt-6">
          <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Dayun Nasgor Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-none text-white">Dayun</h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Nasgor</h2>
          <span className="text-xs text-amber-200/80 font-medium tracking-widest uppercase">Self-Service</span>
        </div>

        <div className="text-[11px] text-amber-100/40 text-center font-medium">
          © Dayun Nasgor Kitchen
        </div>
      </aside>

      {/* 2. MAIN SCROLLABLE CATALOG AREA */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 min-w-0">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#7A1517] text-white -mx-4 -mt-4 mb-6 p-4 shadow-md flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 relative shrink-0 mb-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Dayun Nasgor Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <h1 className="font-extrabold text-xl leading-snug tracking-tight text-white">
            Dayun Nasgor
          </h1>

          <span className="text-[10px] text-amber-200/90 font-bold uppercase tracking-widest mt-0.5">
            Self-Service
          </span>
        </div>

        {/* Top Control: Search Bar + Icon Cart */}
        <div className="flex items-center gap-3 mb-6 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu kesukaanmu..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="lg:hidden relative p-3 bg-white border border-gray-200/80 text-slate-800 rounded-full hover:bg-gray-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Lihat Keranjang"
          >
            <ShoppingCart size={20} className="text-[#7A1517]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7A1517] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

        {/* Banner */}
        <div className="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden mb-8 shadow-sm group">
          <Image
            src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80"
            alt="Promo Special Chicken Katsu"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-center text-white">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-2">
              PROMO HARI INI
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Special Chicken Katsu</h3>
            <p className="text-xs md:text-sm text-gray-200 mt-1 max-w-sm">Nikmati perpaduan rempah asli Nasgor Dayun</p>
          </div>
        </div>

        {/* Categories Dynamic */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#7A1517] text-white'
                  : 'bg-white text-slate-700 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoadingMenu ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-[#7A1517]" />
            <span className="text-xs font-semibold">Memuat Menu Dayun Nasgor...</span>
          </div>
        ) : (
          /* Catalog Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-28 lg:pb-8">
            {filteredMenu.map((item) => (
              <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {/* Floating Mobile Bottom Cart Bar */}
        {totalCartCount > 0 && !isCartOpen && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#7A1517] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs active:scale-[0.98] transition-all border border-amber-300/30 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 text-slate-950 w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs">
                  {totalCartCount}
                </div>
                <div className="text-left">
                  <p className="text-xs text-amber-200">Pesanan Saya</p>
                  <p className="text-sm font-extrabold">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-300">
                <span>Lihat Keranjang</span>
                <span>&gt;</span>
              </div>
            </button>
          </div>
        )}

      </main>

      {/* 3. RIGHT FIXED CART SIDEBAR */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onUpdateNote={handleUpdateNote}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        customerName={customerName}
        setCustomerName={setCustomerName}
        orderType={orderType}
        setOrderType={setOrderType}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 4. QRIS PAYMENT MODAL */}
      <QrisModal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        totalAmount={subtotal}
        customerName={customerName}
        tableNumber={orderType === 'DINE_IN' ? tableNumber : 'Takeaway'}
        onSuccessPay={handleQrisSuccessPay}
      />

    </div>
  )
}
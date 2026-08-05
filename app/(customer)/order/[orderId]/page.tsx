'use client'

import React, { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Flame, 
  ArrowLeft, 
  QrCode, 
  AlertCircle,
  RefreshCw,
  UtensilsCrossed,
  XCircle,      
  RotateCcw      
} from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  note: string | null
  menu: {
    name: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  tableNumber: string | null
  orderType: 'DINE_IN' | 'TAKE_AWAY'
  status: 'PENDING' | 'DITERIMA' | 'DIMASAK' | 'SELESAI' | 'BATAL'
  paymentMethod: 'QRIS' | 'TUNAI_KASIR'
  paymentStatus: 'UNPAID' | 'PAID'
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Polling Auto-Refresh status setiap 4 detik
  useEffect(() => {
    fetchOrderDetail()
    const interval = setInterval(fetchOrderDetail, 4000)
    return () => clearInterval(interval)
  }, [orderId])

  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-4 text-center">
        <RefreshCw size={32} className="animate-spin text-[#7A1517] mb-3" />
        <p className="text-xs font-semibold text-slate-600">Memuat status pesanan kamu...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
        <Link 
          href="/" 
          className="bg-[#7A1517] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#5B0E10] transition-all"
        >
          Kembali ke Menu Utama
        </Link>
      </div>
    )
  }

  // Progress Bar Steps (0: PENDING, 1: DITERIMA, 2: DIMASAK, 3: SELESAI)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0
      case 'DITERIMA': return 1
      case 'DIMASAK': return 2
      case 'SELESAI': return 3
      default: return 0
    }
  }

  const currentStep = getStepIndex(order.status)

  return (
    <div className="min-h-screen bg-[#FDFBF9] p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      
      {/* Card Utama Status */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6 text-center">
        
        {/* Banner Nomor Pesanan & Lokasi */}
        <div className="bg-[#7A1517] text-white p-4 rounded-2xl space-y-1">
          <p className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">Nomor Antrean Anda</p>
          <h1 className="text-4xl font-black tracking-tight">{order.orderNumber}</h1>
          <p className="text-xs text-amber-100/90 font-medium pt-1">
            {order.orderType === 'DINE_IN' ? `Makan di Tempat (${order.tableNumber || 'Meja'})` : 'Bawa Pulang (Takeaway)'} • {order.customerName}
          </p>
        </div>

        {/* Live Stepper Status */}
        <div className="py-2">
          <div className="flex items-center justify-between relative px-2">
            
            {/* Step 1: PENDING */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 0 ? 'bg-[#7A1517] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <Clock size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Menunggu</span>
            </div>

            {/* Step 2: DITERIMA */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 1 ? 'bg-[#7A1517] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Diterima</span>
            </div>

            {/* Step 3: DIMASAK */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 2 ? 'bg-[#7A1517] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <ChefHat size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Dimasak</span>
            </div>

            {/* Step 4: SELESAI */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Selesai</span>
            </div>

            {/* Connecting Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-0">
              <div 
                className="h-full bg-[#7A1517] transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

          </div>
        </div>

        {/* Status Message Dynamic Box */}
        <div className={`p-4 rounded-2xl text-xs font-semibold space-y-1 ${
        order.status === 'BATAL' 
            ? 'bg-red-50 border border-red-200 text-red-900' 
            : 'bg-amber-50/80 border border-amber-200/60 text-slate-800'
        }`}>
        {order.status === 'PENDING' && (
            <>
            <p className="font-extrabold text-[#7A1517] text-sm">Pesanan Terkirim! 📩</p>
            <p className="text-slate-600">
                {order.paymentMethod === 'TUNAI_KASIR' 
                ? 'Silakan lakukan pembayaran tunai di kasir untuk memproses pesanan.'
                : 'Pesananmu sedang menunggu konfirmasi pembayaran dari kasir/dapur.'}
            </p>
            </>
        )}

        {order.status === 'DITERIMA' && (
            <>
            <p className="font-extrabold text-[#7A1517] text-sm">Pesanan Diterima! ✅</p>
            <p className="text-slate-600">Pesanan kamu masuk antrean dapur. Estimasi tunggu: ~10-15 menit.</p>
            </>
        )}

        {order.status === 'DIMASAK' && (
            <>
            <p className="font-extrabold text-[#7A1517] text-sm flex items-center justify-center gap-1">
                <span>Sedang Dimasak Koki! 👨‍🍳</span>
            </p>
            <p className="text-slate-600">Aroma sedap sedang tercipta di dapur Mang Dayun!</p>
            </>
        )}

        {order.status === 'SELESAI' && (
            <div className="space-y-3 text-center">
            <div>
                <p className="font-extrabold text-emerald-700 text-sm">Pesanan Siap Disajikan! 🎉</p>
                <p className="text-slate-600 mt-0.5">
                {order.orderType === 'DINE_IN' 
                    ? 'Makanan sedang diantarkan ke meja kamu. Selamat menikmati!' 
                    : 'Silakan ambil pesananmu di konter Kasir/Dapur.'}
                </p>
            </div>

            <Link
                href="/"
                className="w-full bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
                <UtensilsCrossed size={16} />
                <span>Selesai & Pesan Lagi</span>
            </Link>
            </div>
        )}

        {/* AKSI TAMBAHAN KETIKA PESANAN DIBATALKAN */}
        {order.status === 'BATAL' && (
            <div className="space-y-3 text-center py-1">
            <div className="flex flex-col items-center gap-1.5">
                <XCircle size={36} className="text-red-600 shrink-0" />
                <div>
                <p className="font-extrabold text-red-700 text-sm">Pesanan Dibatalkan ❌</p>
                <p className="text-red-600/90 text-[11px] mt-1 max-w-sm mx-auto leading-relaxed">
                    Mohon maaf, pesanan kamu telah dibatalkan oleh pihak kasir/dapur (stok habis atau kendala operasional). Silakan hubungi kasir atau buat pesanan baru.
                </p>
                </div>
            </div>

            {/* TOMBOL KEMBALI DAN PESAN ULANG */}
            <Link
                href="/"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] mt-2"
            >
                <RotateCcw size={16} />
                <span>Pesan Ulang / Kembali ke Menu</span>
            </Link>
            </div>
        )}
        </div>

      </div>

      {/* Rangkuman Detail Pesanan */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rangkuman Pesanan</h3>
        
        <div className="space-y-3 divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{item.quantity}x {item.menu.name}</p>
                {item.note && <p className="text-[11px] text-red-600 italic mt-0.5">Note: "{item.note}"</p>}
              </div>
              <span className="font-bold text-slate-900">
                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500">Total Pembayaran</span>
          <span className="text-base font-black text-[#7A1517]">
            Rp {order.totalAmount.toLocaleString('id-ID')}
          </span>
        </div>
        
      </div>

    </div>
  )
}
'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  AlertCircle,
  RefreshCw,
  UtensilsCrossed,
  XCircle,      
  RotateCcw,
  Flame
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
  updatedAt: string
  items: OrderItem[]
  queueAhead?: number
  queuePosition?: number
  remainingSeconds?: number
}

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number>(210) // 210 detik = 3.5 menit

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data: Order = await res.json()
        setOrder(data)
        if (typeof data.remainingSeconds === 'number') {
          setTimeLeft(data.remainingSeconds)
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 1. Polling API setiap 4 detik
  useEffect(() => {
    fetchOrderDetail()
    const interval = setInterval(fetchOrderDetail, 4000)
    return () => clearInterval(interval)
  }, [orderId])

  // 2. Countdown Timer Realtime per detik saat DIMASAK
  useEffect(() => {
    if (order?.status !== 'DIMASAK' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [order?.status, timeLeft])

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

  // Helper Format Detik ke MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

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
      
      {/* CARD UTAMA STATUS */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6 text-center">
        
        {/* 1. TOP BANNER UTAMA */}
        <div className="bg-[#7A1517] text-white p-5 rounded-2xl space-y-2 text-center shadow-md">
          {order.status === 'SELESAI' ? (
            <div>
              <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Status Pesanan</p>
              <h1 className="text-3xl font-black text-white my-1 uppercase">Siap Disajikan!</h1>
            </div>
          ) : order.status === 'BATAL' ? (
            <div>
              <p className="text-xs text-red-200 font-bold uppercase tracking-wider">Status Pesanan</p>
              <h1 className="text-3xl font-black text-white my-1">Pesanan Dibatalkan.</h1>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">
                Posisi Antrean Kamu
              </p>
              <h1 className="text-5xl font-black tracking-tight text-white my-1">
                Urutan Ke-{order.queuePosition || 1}
              </h1>
              <p className="text-xs text-amber-100/80 font-medium pt-1">
                {order.queuePosition === 1
                  ? '🔥 Pesananmu berada di urutan paling depan!'
                  : `Masih ada ${(order.queuePosition || 1) - 1} pesanan lain di depanmu.`}
              </p>
            </div>
          )}

          {/* Sub Header Kode Struk & Pelanggan */}
          <div className="pt-3 border-t border-amber-200/20 flex items-center justify-between text-xs text-amber-100/90 font-medium px-2">
            <span>Kode Struk: <strong className="text-white font-mono">{order.orderNumber}</strong></span>
            <span>{order.customerName} ({order.orderType === 'DINE_IN' ? `Meja ${order.tableNumber || '-'}` : 'Takeaway'})</span>
          </div>
        </div>

        {/* 2. DYNAMIC ACTION & FOCUS DISPLAY (DRY: Ditempatkan Terpusat Di Sini) */}
        {order.status === 'DIMASAK' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-1 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-xs">
              <Flame size={14} className="animate-bounce" />
              <span>Sedang Dimasak Mang Dayun</span>
            </div>

            <div className="py-1">
              <span className="text-5xl font-black tracking-tight text-[#7A1517] font-mono">
                {formatTimer(timeLeft)}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {timeLeft > 0 
                ? 'Kuali sedang bergoyang, pesananmu akan segera hangat disajikan!' 
                : 'Hampir siap! Koki sedang menata piring pesananmu.'}
            </p>
          </div>
        )}

        {(order.status === 'PENDING' || order.status === 'DITERIMA') && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1">
            <p className="text-xs text-slate-600 font-semibold">
              {order.paymentMethod === 'TUNAI_KASIR' && order.status === 'PENDING'
                ? 'Mohon bayar di kasir untuk memproses pesananmu.'
                : (order.queueAhead && order.queueAhead > 0)
                ? `Ada ${order.queueAhead} pesanan lain di depanmu. Mohon bersabar ya!`
                : 'Pesananmu dalam urutan paling depan! Menunggu koki mulai memasak.'}
            </p>
          </div>
        )}

        {order.status === 'SELESAI' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-600 font-medium">
              {order.orderType === 'DINE_IN' 
                ? 'Makanan sedang diantarkan ke meja kamu. Selamat menikmati!' 
                : 'Silakan ambil pesananmu di konter Kasir.'}
            </p>
            <Link
              href="/"
              className="w-full bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <UtensilsCrossed size={16} />
              <span>Selesai & Pesan Lagi</span>
            </Link>
          </div>
        )}

        {order.status === 'BATAL' && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col items-center gap-1.5">
              <XCircle size={36} className="text-red-600 shrink-0" />
              <p className="text-red-600/90 text-xs max-w-sm mx-auto leading-relaxed">
                Mohon maaf, pesanan kamu telah dibatalkan oleh pihak kasir/dapur. Silakan hubungi kasir atau buat pesanan baru.
              </p>
            </div>
            <Link
              href="/"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw size={16} />
              <span>Pesan Ulang / Kembali ke Menu</span>
            </Link>
          </div>
        )}
        
        {/* 3. STEPPER PROGRESS VISUAL */}
        <div className="pt-2 pb-1">
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
                currentStep >= 2 ? 'bg-[#7A1517] text-white shadow-md ring-4 ring-amber-400/30' : 'bg-gray-100 text-gray-400'
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

      </div>

      {/* RANGKUMAN DETAIL PESANAN */}
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
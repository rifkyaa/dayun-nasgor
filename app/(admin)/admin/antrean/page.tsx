'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/lib/toast'
import { 
  Search, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  QrCode,
  AlertCircle,
  RefreshCw,
  XCircle,
  UtensilsCrossed
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

export default function AntreanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'DITERIMA' | 'DIMASAK'>('SEMUA')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // 1. Fetch Data Antrean Real-time
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data: Order[] = await res.json()
        setOrders(data)

        if (data.length > 0 && (!selectedOrderId || !data.some(o => o.id === selectedOrderId))) {
          setSelectedOrderId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Gagal mengambil antrean:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  // 2. Handler Update Status
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    // Jika aksi Pembatalan, panggil Toast Konfirmasi Maroon
    if (nextStatus === 'BATAL') {
      showToast.confirmCancel(
        'Konfirmasi Pembatalan',
        'Apakah Anda yakin ingin membatalkan pesanan ini?',
        () => executeStatusUpdate(orderId, nextStatus)
      )
      return
    }

    // Untuk status lainnya (DITERIMA, DIMASAK, SELESAI) langsung eksekusi
    await executeStatusUpdate(orderId, nextStatus)
  }

  // Fungsi eksekusi ke API
  const executeStatusUpdate = async (orderId: string, nextStatus: string) => {
    try {
      setIsUpdating(true)
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) throw new Error('Gagal update status')

      // Notifikasi Toast Sesuai Brand Identity
      if (nextStatus === 'DITERIMA') {
        showToast.success('Pesanan Diterima!', 'Pesanan telah masuk ke daftar antrean dapur.')
      } else if (nextStatus === 'DIMASAK') {
        showToast.info('Mulai Memasak! 👨‍🍳', 'Status pesanan diubah menjadi Dimasak.')
      } else if (nextStatus === 'SELESAI') {
        showToast.success('Pesanan Selesai! 🎉', 'Makanan siap disajikan ke pelanggan.')
      } else if (nextStatus === 'BATAL') {
        showToast.error('Pesanan Dibatalkan', 'Pesanan telah berhasil dibatalkan.')
      }

      await fetchOrders()
    } catch (err) {
      showToast.error('Gagal Mengubah Status', 'Terjadi kesalahan pada server.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Helper Menghitung Timer Tunggu
  const getWaitingTime = (createdAtStr: string) => {
    const created = new Date(createdAtStr).getTime()
    const now = new Date().getTime()
    const diffSec = Math.floor((now - created) / 1000)
    const mins = Math.floor(diffSec / 60)
    const secs = diffSec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'SEMUA' || order.status === filterStatus
    const matchSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const activeOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0]

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Antrean Pemesanan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem Antrean First-Come, First-Served (FCFS) Dapur Dayun
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-700 transition-all shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#7A1517]' : ''} />
          </button>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesanan / nama..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all shadow-xs"
            />
          </div>

          <div className="bg-gray-200/70 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('SEMUA')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'SEMUA' ? 'bg-white text-[#7A1517] shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('DITERIMA')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'DITERIMA' ? 'bg-white text-[#7A1517] shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Diterima
            </button>
            <button
              onClick={() => setFilterStatus('DIMASAK')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'DIMASAK' ? 'bg-white text-[#7A1517] shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Dimasak
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading && orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <RefreshCw size={28} className="animate-spin text-[#7A1517] mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Memuat antrean pesanan real-time...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 space-y-3">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-slate-800">Antrean Dapur Bersih!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada pesanan aktif saat ini. Pesanan baru dari pelanggan akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Queue Cards List */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {filteredOrders.map((order, index) => {
              const isSelected = order.id === selectedOrderId
              const isUrutanSatu = index === 0

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`relative bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md ${
                    isSelected 
                      ? 'border-[#7A1517] ring-2 ring-[#7A1517]/10' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Top Content Area */}
                  <div>
                    {/* Badge URUTAN #1 (FCFS Highlight) */}
                    {isUrutanSatu && (
                      <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-2xs">
                        <span>🏠 URUTAN #1 (FCFS)</span>
                      </div>
                    )}

                    {/* Header Card */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <div>
                        <span className="text-lg font-bold text-[#7A1517]">
                          {order.orderNumber}
                        </span>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {order.tableNumber ? `${order.tableNumber} (${order.customerName})` : `Takeaway (${order.customerName})`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <Clock size={14} />
                        <span>{getWaitingTime(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Items Summary Preview */}
                    <div className="space-y-1.5 text-xs text-slate-700 mb-6">
                      {order.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="font-semibold line-clamp-1">
                          {item.quantity}x {item.menu.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-[11px] text-gray-400 font-medium">
                          + {order.items.length - 2} item lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Area (Sticky at Bottom) */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                    
                    {/* Tombol Utama (Selalu Merah Maroon Konsisten) */}
                    {order.status === 'PENDING' && (
                      <button
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(order.id, 'DITERIMA')
                        }}
                        className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} />
                        <span>Terima Pesanan</span>
                      </button>
                    )}

                    {order.status === 'DITERIMA' && (
                      <button
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(order.id, 'DIMASAK')
                        }}
                        className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <ChefHat size={15} />
                        <span>Mulai Masak</span>
                      </button>
                    )}

                    {order.status === 'DIMASAK' && (
                      <button
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(order.id, 'SELESAI')
                        }}
                        className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <UtensilsCrossed size={15} />
                        <span>Sajikan (Selesai)</span>
                      </button>
                    )}

                    {/* Tombol Batalkan Berbasis Teks + Ikon (Ghost Red) */}
                    <button
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpdateStatus(order.id, 'BATAL')
                      }}
                      className="px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-red-100 flex items-center gap-1"
                      title="Batalkan Pesanan"
                    >
                      <XCircle size={15} />
                      <span>Batal</span>
                    </button>

                  </div>

                </div>
              )
            })}
          </div>

          {/* RIGHT COLUMN: Selected Order Detail Panel */}
          {activeOrder && (
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 sticky top-20 shadow-xs">
              
              {/* Header Detail */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <span className="text-xl font-bold text-[#7A1517]">
                    {activeOrder.orderNumber}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                    <span>{activeOrder.tableNumber || 'Takeaway'}</span>
                    <span>•</span>
                    <span>{activeOrder.customerName}</span>
                  </div>
                </div>

                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {activeOrder.status}
                </span>
              </div>

              {/* List Item Detail */}
              <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Daftar Pesanan
                </p>

                {activeOrder.items.map((item) => (
                  <div key={item.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-start justify-between text-xs">
                      <div className="font-bold text-slate-800 pr-2">
                        {item.menu.name}
                        <p className="text-[#7A1517] font-semibold mt-0.5">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                        {item.quantity}x
                      </span>
                    </div>

                    {item.note && (
                      <div className="bg-red-50/80 border border-red-100 rounded-lg p-2 text-[11px] text-red-700 font-medium flex items-start gap-1.5">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span>{item.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment & Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total Tagihan</p>
                    <p className="text-lg font-bold text-slate-900">
                      Rp {activeOrder.totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                      Metode Bayar
                    </p>
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md mt-1">
                      <QrCode size={12} />
                      <span>{activeOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Main & Cancel Action Buttons */}
                <div className="flex items-center gap-2">
                  {activeOrder.status === 'PENDING' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(activeOrder.id, 'DITERIMA')}
                      className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>Terima Pesanan</span>
                    </button>
                  )}

                  {activeOrder.status === 'DITERIMA' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(activeOrder.id, 'DIMASAK')}
                      className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                    >
                      <ChefHat size={16} />
                      <span>Mulai Masak</span>
                    </button>
                  )}

                  {activeOrder.status === 'DIMASAK' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(activeOrder.id, 'SELESAI')}
                      className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                    >
                      <UtensilsCrossed size={16} />
                      <span>Sajikan (Selesai)</span>
                    </button>
                  )}

                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(activeOrder.id, 'BATAL')}
                    className="px-4 py-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer border border-red-200/60 flex items-center gap-1.5"
                    title="Batalkan Pesanan"
                  >
                    <XCircle size={16} />
                    <span>Batalkan</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  )
}
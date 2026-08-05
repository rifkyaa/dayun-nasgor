'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  QrCode,
  Banknote,
  RefreshCw,
  Eye,
  X,
  Printer
} from 'lucide-react'
import { showToast } from '@/lib/toast'

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
  status: 'SELESAI' | 'BATAL'
  paymentMethod: 'QRIS' | 'TUNAI_KASIR'
  paymentStatus: 'UNPAID' | 'PAID'
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export default function RiwayatPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'SEMUA' | 'SELESAI' | 'BATAL'>('SEMUA')
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<'SEMUA' | 'QRIS' | 'TUNAI_KASIR'>('SEMUA')
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)

  // 1. Fetch Data Riwayat dari API
  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/orders/history')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      showToast.error('Gagal Mengambil Data', 'Terjadi kesalahan saat memuat riwayat.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // 2. Filter Logic
  const filteredData = orders.filter((item) => {
    const matchSearch =
      item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchStatus =
      selectedStatusFilter === 'SEMUA' || item.status === selectedStatusFilter

    const matchMethod =
      selectedMethodFilter === 'SEMUA' || item.paymentMethod === selectedMethodFilter

    return matchSearch && matchStatus && matchMethod
  })

  // 3. Fungsi Export CSV Real Data
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      showToast.warning('Tidak Ada Data', 'Tidak ada riwayat untuk diexport.')
      return
    }

    const headers = ['No Order,Tanggal,Pelanggan,Tipe,Metode Bayar,Status,Total Tagihan\n']
    const rows = filteredData.map((o) => {
      const date = new Date(o.createdAt).toLocaleString('id-ID')
      return `"${o.orderNumber}","${date}","${o.customerName}","${o.orderType}","${o.paymentMethod}","${o.status}",${o.totalAmount}\n`
    })

    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Riwayat_Transaksi_Dayun_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast.success('Export Berhasil!', 'File CSV riwayat transaksi berhasil diunduh.')
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Riwayat Transaksi & Antrean Selesai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh transaksi yang telah diproses oleh dapur dan kasir.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-700 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          title="Refresh Riwayat"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#7A1517]' : ''} />
        </button>
      </div>

      {/* Filter Card Container */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Kelompok Kiri: Dropdown / Button Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 cursor-pointer"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="SELESAI">Selesai</option>
              <option value="BATAL">Batal</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedMethodFilter}
              onChange={(e) => setSelectedMethodFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 cursor-pointer"
            >
              <option value="SEMUA">Semua Metode</option>
              <option value="QRIS">QRIS / Digital</option>
              <option value="TUNAI_KASIR">Bayar di Kasir</option>
            </select>
          </div>

          {/* Kelompok Kanan: Search Bar + Export Button */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Order / Nama..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 bg-[#7A1517] hover:bg-[#5B0E10] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
            >
              <Download size={14} />
              <span>Export Data (.CSV)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <RefreshCw size={28} className="animate-spin text-[#7A1517] mx-auto mb-2" />
            <p className="text-xs font-semibold">Memuat riwayat transaksi...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-semibold text-slate-600">Tidak ada data riwayat transaksi</p>
            <p className="text-xs mt-1">Ganti kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Order</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Pelanggan & Lokasi</th>
                  <th className="py-3.5 px-4">Rincian Item</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Metode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-xs font-medium text-slate-700">
                {filteredData.map((row) => {
                  const formattedDate = new Date(row.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  
                  const summaryText = row.items
                    .map((i) => `${i.quantity}x ${i.menu.name}`)
                    .join(', ')

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID Transaksi */}
                      <td className="py-4 px-4 font-bold text-[#7A1517]">
                        {row.orderNumber}
                      </td>

                      {/* Waktu */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {formattedDate} WIB
                      </td>

                      {/* Pelanggan & Lokasi */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{row.customerName}</p>
                        <p className="text-[11px] text-gray-400">
                          {row.orderType === 'DINE_IN' ? `Makan di Tempat (${row.tableNumber || 'Meja'})` : 'Takeaway'}
                        </p>
                      </td>

                      {/* Rincian Item */}
                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate" title={summaryText}>
                        {summaryText}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        Rp {row.totalAmount.toLocaleString('id-ID')}
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200">
                          {row.paymentMethod === 'QRIS' ? <QrCode size={12} /> : <Banknote size={12} />}
                          <span>{row.paymentMethod === 'TUNAI_KASIR' ? 'TUNAI' : 'QRIS'}</span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {row.status === 'SELESAI' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <XCircle size={12} />
                            <span>Batal</span>
                          </span>
                        )}
                      </td>

                      {/* Action Detail Button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderForDetail(row)}
                          className="p-1.5 text-slate-500 hover:text-[#7A1517] hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL STRUK DETAIL TRANSAKSI */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Struk Transaksi</h3>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1 text-gray-400 hover:text-slate-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Struk */}
            <div className="text-center space-y-1 py-2">
              <p className="text-lg font-black text-[#7A1517]">{selectedOrderForDetail.orderNumber}</p>
              <p className="text-xs text-slate-600 font-semibold">{selectedOrderForDetail.customerName}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(selectedOrderForDetail.createdAt).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2 border-t border-b border-dashed border-gray-200 py-3 text-xs">
              {selectedOrderForDetail.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{item.quantity}x {item.menu.name}</p>
                    {item.note && <p className="text-[10px] text-red-600 italic">"{item.note}"</p>}
                  </div>
                  <span className="font-bold text-slate-900">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-1">
              <span>Total Pembayaran</span>
              <span className="text-base text-[#7A1517]">
                Rp {selectedOrderForDetail.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Action Print / Tutup */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-[#7A1517] hover:bg-[#5B0E10] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer size={15} />
                <span>Cetak Struk</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Flame,
  UtensilsCrossed,
  Loader2,
  Users,
  ShoppingBag
} from 'lucide-react'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    todayDateStr: string
    summary: {
      totalOmset: number
      totalPorsi: number
      avgTatMinutes: number
      targetPorsi: number
    }
    topMenus: any[]
    recentOrders: any[]
  }>({
    todayDateStr: '',
    summary: {
      totalOmset: 0,
      totalPorsi: 0,
      avgTatMinutes: 4,
      targetPorsi: 150,
    },
    topMenus: [],
    recentOrders: [],
  })

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed fetching dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const { summary, topMenus, recentOrders, todayDateStr } = data
  const progressPercent = Math.min(100, Math.round((summary.totalPorsi / summary.targetPorsi) * 100))

  // Helper Badge Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">Selesai</span>
      case 'DIMASAK':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">Dimasak</span>
      case 'DITERIMA':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">Diterima</span>
      case 'PENDING':
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">Menunggu</span>
      default:
        return <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header & Dynamic Date Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ringkasan Operasional Dapur
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Data real-time jam buka (16:00 WIB - Selesai).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar size={15} className="text-[#7A1517]" />
          <span>{todayDateStr || 'Hari Ini'}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-[#7A1517]" />
          <p className="text-xs font-bold">Sinkronisasi Data Dapur Mang Dayun...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Total Omset */}
            <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#7A1517] flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL OMSET HARI INI
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
                  Rp {summary.totalOmset.toLocaleString('id-ID')}
                </h2>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  <TrendingUp size={12} />
                  <span>Real-time Sync</span>
                </span>
              </div>

              <Wallet size={90} className="absolute -right-4 -bottom-4 text-gray-100/60 pointer-events-none -rotate-12" />
            </div>

            {/* Card 2: Pesanan Selesai */}
            <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#7A1517] flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL PESANAN HARI INI
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {summary.totalPorsi}
                  </span>
                  <span className="text-xs font-bold text-gray-500">porsi</span>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#7A1517] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-right text-gray-400 font-bold">
                  Target harian: {summary.targetPorsi} porsi
                </p>
              </div>

              <CheckCircle2 size={90} className="absolute -right-4 -bottom-4 text-gray-100/60 pointer-events-none -rotate-12" />
            </div>

            {/* Card 3: Avg Cooking Time */}
            <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    AVG MASAK (FCFS)
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {summary.avgTatMinutes || 4}
                  </span>
                  <span className="text-xs font-bold text-gray-500">menit / porsi</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  <AlertTriangle size={13} className="text-amber-600" />
                  <span>Estimasi Dapur: 3-5m per porsi</span>
                </span>
              </div>

              <Clock size={90} className="absolute -right-4 -bottom-4 text-gray-100/60 pointer-events-none -rotate-12" />
            </div>

          </div>

          {/* Main Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Heatmap Jam Sibuk */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Jam Sibuk Antrean (Buka 16:00 WIB)
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Puncak pembeli paling padat di jam 17:00 - 18:00 (Malam Minggu/Jam Makan)
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7A1517]" />
                      <span className="text-gray-600">Sangat Padat</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                      <span className="text-gray-600">Normal</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-2">
                    <div className="h-10 bg-amber-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-900" title="16:00 - Mulai Buka">16:00</div>
                    <div className="h-10 bg-[#7A1517] rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs" title="17:00 - PEAK BANYAK PEMBELI">17:00 🔥</div>
                    <div className="h-10 bg-[#7A1517] rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs" title="18:00 - PEAK BANYAK PEMBELI">18:00 🔥</div>
                    <div className="h-10 bg-amber-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-900" title="19:00 - Normal">19:00</div>
                    <div className="h-10 bg-rose-400 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" title="20:00 - Ramai Makan Malam">20:00</div>
                    <div className="h-10 bg-[#7A1517] rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs" title="21:00 - Ramai Minggu Malam">21:00</div>
                    <div className="h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-500" title="22:00 - Sepi / Tutup">22:00</div>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 font-bold mt-2 px-1">
                    <span>16:00 (Buka Dapur)</span>
                    <span className="text-[#7A1517]">17:00-18:00 (Peak Ramai)</span>
                    <span>22:00 (Tutup)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Menu Terlaris Real-Time */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Flame className="text-amber-500 fill-amber-500 w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  Menu Terlaris Hari Ini
                </h3>
              </div>

              <div className="space-y-4">
                {topMenus.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Belum ada menu terjual hari ini.
                  </p>
                ) : (
                  topMenus.map((menu) => (
                    <div key={menu.id} className="flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 relative shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400">
                          {menu.image ? (
                            <Image
                              src={menu.image}
                              alt={menu.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="48px"
                            />
                          ) : (
                            <UtensilsCrossed size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">
                            {menu.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {menu.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">
                          {menu.sold}
                        </span>
                        <p className="text-[10px] font-bold text-gray-400">
                          porsi
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* TABEL BARU: DAFTAR PEMESAN HARI INI */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#7A1517] flex items-center justify-center font-bold">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Daftar Transaksi / Pemesan Hari Ini
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {recentOrders.length} transaksi tercatat untuk shift hari ini
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Nama Pemesan</th>
                    <th className="py-2.5 px-3">Tipe / Lokasi</th>
                    <th className="py-2.5 px-3">Menu Dipesan</th>
                    <th className="py-2.5 px-3 text-right">Total Bayar</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Belum ada pesanan masuk hari ini.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-500 whitespace-nowrap">
                          {order.timeStr} WIB
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                          {order.customerName}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">
                          {order.orderType}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={order.itemsSummary}>
                          {order.itemsSummary}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
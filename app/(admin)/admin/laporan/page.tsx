'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Timer, 
  Receipt, 
  Info,
  ChevronDown,
  Loader2
} from 'lucide-react'

export default function LaporanPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d')
  const [isLoading, setIsLoading] = useState(true)

  // Live States
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    avgTatMinutes: 0,
    avgTatSecRem: 0,
  })
  const [categoryReports, setCategoryReports] = useState<any[]>([])
  const [dailyEfficiency, setDailyEfficiency] = useState<any[]>([])

  // Fetch Data dari API
  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/reports?range=${dateRange}`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary)
        setCategoryReports(data.categoryReports)
        setDailyEfficiency(data.dailyEfficiency)
      }
    } catch (err) {
      console.error('Failed to load report:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  // Fungsi Export Data ke file Excel (.CSV)
  const handleExportCSV = () => {
    if (categoryReports.length === 0) {
      alert('Tidak ada data untuk di-export!')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'Kategori,Porsi Terjual,Pendapatan (Rp),Estimasi Avg TAT\n'

    categoryReports.forEach((cat) => {
      csvContent += `"${cat.name}",${cat.soldCount},${cat.revenue},"${cat.avgTat}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Laporan_Dayun_Nasgor_${dateRange}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      {/* Top Bar Controls: Date Selector + Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar size={15} className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>

        {/* Export Buttons Group */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border-2 border-[#7A1517] text-[#7A1517] hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel (.CSV)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#7A1517] hover:bg-[#5B0E10] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <Download size={15} />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-[#7A1517]" />
          <p className="text-xs font-bold">Mengkalkulasi Metrik FCFS & Laporan...</p>
        </div>
      ) : (
        /* Main Grid Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Stat Summary Cards */}
          <div className="space-y-4">
            
            {/* 1. Total Pendapatan Card */}
            <div className="relative bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-2xl border border-red-100 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#7A1517]">
                  <Receipt size={20} />
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <TrendingUp size={12} />
                  <span>Aktif</span>
                </span>
              </div>

              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                TOTAL PENDAPATAN
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Rp {summary.totalRevenue.toLocaleString('id-ID')}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Berdasarkan pesanan selesai
              </p>
            </div>

            {/* 2. Avg Turnaround Time (TAT) Card - FCFS Metric */}
            <div className="bg-[#7A1517] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Timer size={20} />
                </div>
                <div className="flex items-center gap-1 text-amber-200/90 text-xs font-medium">
                  <TrendingUp size={13} />
                  <span>FCFS Realtime</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-amber-100/80 text-[11px] font-bold tracking-wider uppercase">
                <span title="Waktu rata-rata dari pesanan masuk hingga selesai dimasak">
                  <Info size={13} className="text-amber-200/60 cursor-pointer" />
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold tracking-tight">{summary.avgTatMinutes}</span>
                <span className="text-sm font-semibold text-amber-200">mnt</span>
                <span className="text-3xl font-extrabold tracking-tight ml-1">{summary.avgTatSecRem}</span>
                <span className="text-sm font-semibold text-amber-200">dtk</span>
              </div>

              <p className="text-[11px] text-amber-200/70 font-medium mt-1">
                Target FCFS: &lt; 15 mnt
              </p>

              {/* Target Progress Bar */}
              <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    summary.avgTatMinutes <= 15 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} 
                  style={{ width: `${Math.min(100, (summary.avgTatMinutes / 15) * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Total Antrean FCFS Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  TOTAL ANTREAN TERLAYANI
                </p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                  {summary.totalOrdersCount.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-500">pesanan</span>
                </h3>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-700">
                <Receipt size={20} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Efisiensi Chart + Category Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Dynamic Efisiensi Antrean Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Efisiensi Antrean Harian (FCFS)
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Tren Rata-rata TAT (menit) selama 7 hari terakhir
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A1517]" />
                    <span>Aktual TAT</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Bar Display */}
              <div className="h-44 bg-slate-900 rounded-xl p-4 flex items-end justify-between text-white relative gap-2 overflow-hidden">
                {dailyEfficiency.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group z-10">
                    <span className="text-[10px] text-amber-300 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.avgTat}m
                    </span>
                    <div 
                      className="w-full max-w-[28px] bg-gradient-to-t from-[#7A1517] to-red-500 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${Math.min(100, (item.avgTat / 20) * 100)}%` }}
                    />
                    <span className="text-[10px] text-gray-400 font-medium mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Laporan Penjualan per Kategori Table */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">
                  Laporan Penjualan per Kategori
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Kategori Menu</th>
                      <th className="py-2.5 px-3 text-center">Porsi Terjual</th>
                      <th className="py-2.5 px-3 text-right">Pendapatan</th>
                      <th className="py-2.5 px-3 text-center">Avg TAT</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
                    {categoryReports.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                          Belum ada transaksi selesai pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      categoryReports.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-[#7A1517] flex items-center justify-center font-bold text-xs">
                                {cat.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-800">{cat.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-slate-600">
                            {cat.soldCount} porsi
                          </td>

                          <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                            Rp {cat.revenue.toLocaleString('id-ID')}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              {cat.avgTat}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  )
}
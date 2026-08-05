'use client'

import React from 'react'
import { User, Utensils, MapPin, ShoppingBag } from 'lucide-react'

interface CustomerFormProps {
  customerName: string
  setCustomerName: (name: string) => void
  orderType: 'DINE_IN' | 'TAKEAWAY'
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void
  tableNumber: string
  setTableNumber: (table: string) => void
}

export default function CustomerForm({
  customerName,
  setCustomerName,
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
}: CustomerFormProps) {
  // Daftar Pilihan Meja Khusus Dine In
  const tableOptions = [
    'Meja T-01', 'Meja T-02', 'Meja T-03', 'Meja T-04', 'Meja T-05',
    'Meja T-06', 'Meja T-07', 'Meja T-08', 'Meja T-09', 'Meja T-10',
    'Meja T-11', 'Meja T-12', 'Meja T-13', 'Meja T-14', 'Meja T-15'
  ]

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3.5 shadow-2xs">
      <p className="text-[10px] font-extrabold text-[#7A1517] uppercase tracking-wider">
        Informasi Pemesan
      </p>

      {/* 1. Input Nama Pelanggan */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          <span>Nama Pelanggan <span className="text-red-500">*</span></span>
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Contoh: Budi Santoso"
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all font-medium text-slate-800"
        />
      </div>

      {/* 2. Toggle Tipe Pesanan (Dine In vs Takeaway) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <Utensils size={12} className="text-gray-400" />
          <span>Tipe Pesanan <span className="text-red-500">*</span></span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setOrderType('DINE_IN')
              if (!tableNumber) setTableNumber('Meja T-01') // Default pilihan meja
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'DINE_IN'
                ? 'border-[#7A1517] bg-red-50/60 text-[#7A1517] ring-1 ring-[#7A1517]'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Utensils size={13} />
            <span>Makan di Tempat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOrderType('TAKEAWAY')
              setTableNumber('-') // Kosongkan meja jika takeaway
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'TAKEAWAY'
                ? 'border-[#7A1517] bg-red-50/60 text-[#7A1517] ring-1 ring-[#7A1517]'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={13} />
            <span>Bawa Pulang</span>
          </button>
        </div>
      </div>

      {/* 3. Select Nomor Meja (HANYA MUNCUL JIKA DINE IN) */}
      {orderType === 'DINE_IN' && (
        <div className="space-y-1 animate-in fade-in duration-200">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <MapPin size={12} className="text-gray-400" />
            <span>Pilih Nomor Meja <span className="text-red-500">*</span></span>
          </label>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all font-medium text-slate-800"
          >
            <option value="">-- Pilih Nomor Meja --</option>
            {tableOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
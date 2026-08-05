'use client'

import React from 'react'
import { X, QrCode, CheckCircle2, User, MapPin } from 'lucide-react'

interface QrisModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  customerName: string
  tableNumber: string
  onSuccessPay: () => void
}

export default function QrisModal({
  isOpen,
  onClose,
  totalAmount,
  customerName,
  tableNumber,
  onSuccessPay,
}: QrisModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-slate-800 p-1.5 rounded-full"
        >
          <X size={20} />
        </button>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Pembayaran QRIS</h3>
          <p className="text-xs text-gray-500 mt-0.5">Scan kode di bawah untuk menyelesaikan pesanan</p>
        </div>

        {/* Info Pemesan Brief */}
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-[#7A1517]" />
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#7A1517] font-bold">
            <MapPin size={13} />
            <span>{tableNumber}</span>
          </div>
        </div>

        {/* QR Code Frame */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-5 rounded-2xl flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100">
            <QrCode size={150} className="text-[#7A1517]" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 mt-2">DAYUN NASGOR STATIS QRIS</span>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium">Total Pembayaran</p>
          <p className="text-2xl font-black text-[#7A1517]">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
        </div>

        <button
          onClick={() => {
            onSuccessPay()
            onClose()
          }}
          className="w-full bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <CheckCircle2 size={16} />
          <span>Simulasi Saya Sudah Bayar</span>
        </button>
      </div>
    </div>
  )
}
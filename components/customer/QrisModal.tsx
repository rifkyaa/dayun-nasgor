import Image from 'next/image'
import { X, CheckCircle2, QrCode } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative">
        
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-slate-800 rounded-lg cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header Modal */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#7A1517]/10 text-[#7A1517] px-3 py-1 rounded-full text-xs font-bold">
            <QrCode size={14} />
            <span>Pembayaran QRIS</span>
          </div>
          <h3 className="text-xl font-black text-slate-800">Scan untuk Membayar</h3>
          <p className="text-xs text-slate-500">
            {customerName} • {tableNumber}
          </p>
        </div>

        {/* Total Tagihan */}
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Pembayaran</p>
          <p className="text-2xl font-black text-[#7A1517]">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
        </div>

        {/* 💥 GAMBAR QRIS LOKAL ASLI 💥 */}
        <div className="relative w-56 h-56 mx-auto bg-white p-2 rounded-2xl border-2 border-dashed border-[#7A1517]/30 shadow-xs flex items-center justify-center overflow-hidden">
          <Image
            src="/images/qris2.jpeg"
            alt="QRIS Dayun Nasgor"
            fill
            className="object-contain p-2"
            priority
          />
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          Dapat di-scan menggunakan Gopey, OVO, Dana, ShopeePay, atau Mobile Banking pilihanmu.
        </p>

        <button
          onClick={onSuccessPay}
          className="w-full bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <CheckCircle2 size={16} />
          <span>Saya Sudah Membayar</span>
        </button>

      </div>
    </div>
  )
}
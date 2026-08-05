'use client'

import React from 'react'
import Image from 'next/image'
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Ticket, 
  QrCode, 
  Banknote, 
  UtensilsCrossed,
  FileText
} from 'lucide-react'
import { MenuItem } from './MenuCard'
import CustomerForm from './CustomerForm'

export interface CartItem extends MenuItem {
  qty: number
  note?: string
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQty: (id: string, delta: number) => void
  onUpdateNote: (id: string, noteText: string) => void
  paymentMethod: 'QRIS' | 'KASIR'
  setPaymentMethod: (method: 'QRIS' | 'KASIR') => void
  customerName: string
  setCustomerName: (name: string) => void
  orderType: 'DINE_IN' | 'TAKEAWAY'
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void
  tableNumber: string
  setTableNumber: (table: string) => void
  onSubmitOrder: () => void
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onUpdateNote,
  paymentMethod,
  setPaymentMethod,
  customerName,
  setCustomerName,
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  onSubmitOrder,
}: CartSidebarProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // Validasi form aktif/tidaknya tombol kirim
  const isFormValid = customerName.trim().length > 0 && (orderType === 'TAKEAWAY' || (orderType === 'DINE_IN' && tableNumber !== ''))

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Cart Drawer */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-full sm:w-96 lg:w-80 xl:w-96 bg-white border-l border-gray-100 shadow-2xl lg:shadow-none z-50 lg:z-auto flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-[#7A1517]">Pesanan Saya</h3>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
              <UtensilsCrossed size={44} className="mb-3 text-gray-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-700">Keranjang masih kosong</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Pilih menu lezat pilihanmu untuk mulai memesan.
              </p>
            </div>
          ) : (
            <>
              {/* ITEM LIST CARDS */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 relative shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-slate-900 text-xs truncate">{item.name}</h5>
                          <button
                            onClick={() => onUpdateQty(item.id, -item.qty)}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
                            <button onClick={() => onUpdateQty(item.id, -1)} className="p-0.5 text-slate-600 hover:text-[#7A1517]">
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                            <button onClick={() => onUpdateQty(item.id, 1)} className="p-0.5 text-slate-600 hover:text-[#7A1517]">
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="font-extrabold text-xs text-slate-900">
                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Note Input */}
                    <div className="pt-1 border-t border-gray-200/60">
                      <div className="flex items-center gap-1.5 text-gray-400 focus-within:text-[#7A1517]">
                        <FileText size={12} className="shrink-0" />
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => onUpdateNote(item.id, e.target.value)}
                          placeholder="Tambah catatan (misal: Pedas sedang, tanpa acar)..."
                          className="w-full text-[11px] bg-transparent focus:outline-none text-slate-700 placeholder:text-gray-400 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VOUCHER BANNER */}
              <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/60 transition-colors">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Ticket size={15} className="text-amber-600" />
                  <span>Punya Kode Promo?</span>
                </div>
                <span className="text-amber-800 font-bold">&gt;</span>
              </div>

              {/* SEPARATE CUSTOMER FORM COMPONENT */}
              <CustomerForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                orderType={orderType}
                setOrderType={setOrderType}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
              />
            </>
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50/90 border-t border-gray-100 space-y-3 shrink-0">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200 text-slate-900">
                <span className="font-extrabold text-xs">Total</span>
                <span className="font-black text-lg text-slate-900">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                METODE PEMBAYARAN
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-[#7A1517] bg-red-50/50 text-[#7A1517] font-bold ring-1 ring-[#7A1517]'
                      : 'border-gray-200 bg-white text-gray-500 font-semibold'
                  }`}
                >
                  <QrCode size={15} />
                  <span className="text-[10px]">QRIS / DIGITAL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('KASIR')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                    paymentMethod === 'KASIR'
                      ? 'border-[#7A1517] bg-red-50/50 text-[#7A1517] font-bold ring-1 ring-[#7A1517]'
                      : 'border-gray-200 bg-white text-gray-500 font-semibold'
                  }`}
                >
                  <Banknote size={15} />
                  <span className="text-[10px]">BAYAR DI KASIR</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={onSubmitOrder}
              disabled={!isFormValid}
              className={`w-full py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-all shadow-md ${
                !isFormValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#7A1517] hover:bg-[#5B0E10] text-white active:scale-[0.98]'
              }`}
            >
              <span className="text-xs uppercase tracking-wider">PESAN SEKARANG</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
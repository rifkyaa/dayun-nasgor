'use client'

import Image from 'next/image'
import { Plus, Ban } from 'lucide-react'
import StatusBadge from './StatusBadge'

export interface MenuItem {
  id: string
  name: string
  category: string
  description: string
  price: number
  image: string
  isBestSeller?: boolean
  isAvailable?: boolean // <-- TAMBAHKAN PROPERTI INI
}

interface MenuCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export default function MenuCard({ item, onAddToCart }: MenuCardProps) {
  // Evaluasi isAvailable: Jika nilainya boolean eksplisit gunakan itu, jika undefined/null anggap TRUE
  const isAvailable = 
    typeof item.isAvailable === 'boolean' 
      ? item.isAvailable 
      : typeof (item as any).available === 'boolean'
      ? (item as any).available
      : true // <-- DEFAULT IS TRUE (Anti-Habis Semua)

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group ${
        !isAvailable ? 'opacity-80 bg-gray-50/50' : ''
      }`}
    >
      <div>
        {/* Food Image */}
        <div className="relative h-44 w-full bg-[#FFFFFF] overflow-hidden">
          <Image
            src={item.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            fill
            className={`object-contain transition-transform duration-300 ${
              isAvailable ? 'group-hover:scale-105' : 'grayscale'
            }`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Badge Best Seller (Hanya jika tersedia) */}
          {item.isBestSeller && isAvailable && (
            <div className="absolute top-3 left-3">
              <StatusBadge label="BEST SELLER" variant="amber" />
            </div>
          )}

          {/* OVERLAY BADGE HABIS / SOLD OUT */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] flex items-center justify-center p-2">
              <span className="bg-red-600/95 text-white font-black text-xs px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-red-400/40">
                <span>Habis / Sold Out</span>
              </span>
            </div>
          )}
        </div>

        {/* Info Details */}
        <div className="p-4 space-y-1.5">
          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-4 pt-0 flex items-center justify-between">
        <span
          className={`font-extrabold text-sm ${
            isAvailable ? 'text-slate-900' : 'text-slate-400 line-through'
          }`}
        >
          Rp {(item.price ?? 0).toLocaleString('id-ID')}
        </span>

        {/* Tombol Tambah / Locked Button */}
        <button
          disabled={!isAvailable}
          onClick={() => isAvailable && onAddToCart(item)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            isAvailable
              ? 'bg-[#7A1517] hover:bg-[#5B0E10] text-white active:scale-95 shadow-xs cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300/60 shadow-none'
          }`}
        >
          {isAvailable ? (
            <>
              <Plus size={14} />
              <span>Tambah</span>
            </>
          ) : (
            <span>Stok Habis</span>
          )}
        </button>
      </div>
    </div>
  )
}
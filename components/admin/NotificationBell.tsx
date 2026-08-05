'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, ShoppingBag, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch Notifikasi secara otomatis setiap 10 detik (Polling)
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll tiap 10 detik

    // Close dropdown saat klik di luar area
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-slate-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        title="Notifikasi Pesanan"
      >
        <Bell size={19} />
        
        {/* Dynamic Badge Count */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#7A1517] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Popover */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#7A1517]" />
              <h4 className="font-extrabold text-slate-800 text-xs">Pesanan Masuk Terbaru</h4>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-[#7A1517] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Butuh Aksinya
              </span>
            )}
          </div>

          {/* List Notifikasi */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                Belum ada pesanan terbaru.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                    notif.status === 'PENDING' ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#7A1517] flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-xs text-slate-900 truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {notif.subtitle}
                    </p>

                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {notif.items}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/60">
                      <span className="text-xs font-extrabold text-[#7A1517]">
                        Rp {notif.amount?.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        notif.status === 'SELESAI' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {notif.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Popover */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <Link
              href="/admin/antrean"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#7A1517] hover:underline"
            >
              Lihat Semua Antrean Dapur &gt;
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}
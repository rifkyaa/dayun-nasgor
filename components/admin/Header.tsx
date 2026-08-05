'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, Menu as MenuIcon, User, Lock, Key, X, Check, Loader2 } from 'lucide-react'
import NotificationBell from '@/components/admin/NotificationBell'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { data: session, update } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State Form Edit
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Ambil data user dari Session
  const userName = session?.user?.name || 'User'
  const userUsername = (session?.user as any)?.username || 'admin'
  const userRole = (session?.user as any)?.role || 'KITCHEN_STAFF'

  // Fungsi membuat Inisial dari Nama (e.g., "Mang Dayun" -> "MD")
  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Format Tampilan Role
  const formatRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Owner / Super Admin'
      case 'KASIR':
        return 'Staff Kasir'
      case 'KITCHEN_STAFF':
        return 'Kitchen Staff / Chef'
      default:
        return role
    }
  }

  // Handle Buka Modal & Pre-fill State
  const handleOpenModal = () => {
    setName(userName)
    setUsername(userUsername)
    setPassword('')
    setMessage(null)
    setIsModalOpen(true)
  }

  // Handle Submit Update Profil
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui profil')
      }

      setMessage({ type: 'success', text: data.message })
      
      // Refresh session di NextAuth agar UI langsung berubah
      await update({ name, username })

      setTimeout(() => {
        setIsModalOpen(false)
      }, 1200)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
        {/* Left Side: Hamburger (Mobile Only) + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-[#7A1517] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open Mobile Menu"
          >
            <MenuIcon size={22} />
          </button>

          <h1 className="text-base md:text-lg font-bold text-slate-800">
            Nasi Goreng Dayun
          </h1>
        </div>

        {/* Right Side: Search + Notifications + Profile */}
        <div className="flex items-center gap-3 md:gap-5">
          <NotificationBell />
          {/* Divider */}
          <div className="h-6 w-[1px] bg-gray-200" />

          {/* User Profile Info (Dinamis + Clickable) */}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-colors text-left group cursor-pointer"
            title="Klik untuk ubah profil & password"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-[#7A1517] text-sm shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <span>{getInitials(userName)}</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-[#7A1517] transition-colors">
                {userName}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {formatRole(userRole)}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* MODAL EDIT PROFIL & PASSWORD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#7A1517] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User size={20} className="text-amber-300" />
                <h3 className="font-bold text-base">Pengaturan Profil & Akun</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProfile} className="p-6 space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Input Nama */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] font-medium"
                  />
                </div>
              </div>

              {/* Input Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Username</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] font-medium"
                  />
                </div>
              </div>

              {/* Input Password Baru */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Password Baru <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] font-medium"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#7A1517] hover:bg-[#5B0E10] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
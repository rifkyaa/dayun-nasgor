'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  Utensils, 
  BarChart3, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react'

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto Collapse/Expand berdasarkan Ukuran Layar Window
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname, setIsMobileOpen])

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Antrean Pemesanan', href: '/admin/antrean', icon: ClipboardList },
    { name: 'Riwayat', href: '/admin/riwayat', icon: History },
    { name: 'Kelola Menu', href: '/admin/menu', icon: Utensils },
    { name: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
  ]

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/admin/login',
    })
  }
  
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        // 💥 DITAMBAHKAN h-[100dvh] & overflow-hidden 💥
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] bg-[#7A1517] text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-50 shrink-0 shadow-xl lg:shadow-none overflow-hidden ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Toggle Collapse Desktop Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-white text-[#7A1517] p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 transition-transform active:scale-95 z-30 cursor-pointer"
          title={isCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        {/* TOP & NAV SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Header Brand */}
          <div className="p-5 flex items-center justify-between border-b border-dashed border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative shrink-0 flex items-center justify-center">
                <Image
                  src="/logo.png" 
                  alt="Dayun Nasgor Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col transition-opacity duration-200">
                  <span className="font-extrabold text-xl leading-none tracking-tight text-white">
                    Dayun
                  </span>
                  <span className="font-extrabold text-xl leading-tight tracking-tight text-white mb-0.5">
                    Nasgor
                  </span>
                  <span className="text-[10px] text-amber-100/70 font-medium tracking-wide">
                    Kitchen Management
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="mt-4 space-y-0.5 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-4 px-6 py-3.5 transition-all text-sm font-semibold ${
                    isActive
                      ? 'bg-[#5B0E10] text-[#F3C623]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  } ${isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-0' : ''}`}
                  title={isCollapsed && !isMobileOpen ? item.name : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F3C623]" />
                  )}

                  <Icon 
                    size={22} 
                    className={isActive ? 'text-[#F3C623]' : 'text-white/80'} 
                  />
                  
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="whitespace-nowrap transition-opacity tracking-wide">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-dashed border-white/20 p-3 bg-[#7A1517]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-white/80 hover:bg-red-900/40 hover:text-white rounded-xl transition-colors text-sm font-semibold cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-0' : ''
            }`}
            title={isCollapsed && !isMobileOpen ? "Logout" : undefined}
          >
            <LogOut size={20} className="text-red-300 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
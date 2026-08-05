'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (res?.error) {
        setErrorMsg('Username atau Password salah!')
      } else {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan sistem.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 md:p-8">
      {/* MAIN CONTAINER CARD */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 md:min-h-[580px] border border-gray-100 my-auto">
        
        {/* LEFT COLUMN: Maroon Branding Panel (Desktop Only) */}
        <div className="hidden md:flex bg-[#7A1517] text-white p-10 flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="space-y-1 mt-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Dayun Nasgor
            </h1>
            <p className="text-amber-200/90 text-xs lg:text-sm font-semibold uppercase tracking-wider">
              Kitchen Management
            </p>
          </div>

          {/* Circular Logo Frame */}
          <div className="relative my-6">
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-dashed border-amber-300/60 p-3 flex items-center justify-center bg-white/5 backdrop-blur-xs shadow-[0_0_50px_rgba(251,191,36,0.2)]">
              <div className="w-full h-full relative flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Dayun Nasgor Logo"
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-amber-100/70 font-medium max-w-xs mb-2">
            Sistem Kitchen Manajemen Dayun Nasgor
          </p>
        </div>

        {/* RIGHT COLUMN: Form Login (Desktop & Mobile) */}
        <div className="p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* MOBILE ONLY BRANDING HEADER */}
            <div className="flex md:hidden items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-[#7A1517] p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Dayun Nasgor Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#7A1517] leading-none">
                  Dayun Nasgor
                </h1>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">
                  Kitchen Management
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Silakan login menggunakan akun Anda.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan Username Anda"
                    className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password Anda"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7A1517] hover:bg-[#5B0E10] text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] mt-2 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Memproses Login...</span>
                  </>
                ) : (
                  <span>Masuk Ke Sistem</span>
                )}
              </button>

              {/* Lupa Password Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => alert('Silakan hubungi Super Admin untuk reset password.')}
                  className="text-xs font-bold text-[#7A1517] hover:underline transition-all cursor-pointer"
                >
                  Lupa password?
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  )
}
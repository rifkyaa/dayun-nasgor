import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProviders from '@/components/providers/AuthProviders'
import { Toaster } from 'sonner'

// 2. Konfigurasi Font
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Dayun Nasgor - Sistem Pemesanan & Antrean",
  description: "Sistem Antrean Pemesanan Nasi Goreng Dayun berbasis FCFS",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.ico',
    apple: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <AuthProviders>
          {children}
          <Toaster
            position="top-center"
            closeButton
            toastOptions={{
              style: {
                background: '#FDFBF9',
                border: '1px solid #7A1517',
                color: '#1E293B',
                borderRadius: '1rem', // rounded-2xl
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                fontFamily: 'inherit',
              },
              classNames: {
                title: 'font-bold text-xs text-[#7A1517]',
                description: 'text-[11px] text-slate-600 mt-0.5 font-medium',
                actionButton: 'bg-[#7A1517] hover:bg-[#5B0E10] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                cancelButton: 'bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                closeButton: 'bg-white text-slate-500 border border-gray-200 hover:bg-gray-100',
              },
            }}
          />
        </AuthProviders>
      </body>
    </html>
  )
}
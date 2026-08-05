export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans text-slate-800 antialiased">
      {children}
    </div>
  )
}
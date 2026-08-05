interface StatusBadgeProps {
  label: string
  variant?: 'amber' | 'emerald' | 'red' | 'maroon'
}

export default function StatusBadge({ label, variant = 'amber' }: StatusBadgeProps) {
  const variantStyles = {
    amber: 'bg-amber-400 text-slate-950',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-700',
    maroon: 'bg-[#7A1517] text-white',
  }

  return (
    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider ${variantStyles[variant]}`}>
      {label}
    </span>
  )
}
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'amber' | 'rune' | 'ash' | 'red' | 'green'
  className?: string
}

const variants = {
  amber: 'bg-amber/10 text-amber border border-amber/20',
  rune: 'bg-rune/10 text-rune-light border border-rune/20',
  ash: 'bg-ash-700/50 text-ash-200 border border-ash-700',
  red: 'bg-red-900/30 text-red-400 border border-red-900/50',
  green: 'bg-green-900/30 text-green-400 border border-green-900/50',
}

export function Badge({ children, variant = 'ash', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

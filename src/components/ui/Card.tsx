import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function Card({ className, children, hover = false, glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-void-800 border border-void-600 rounded-xl p-5 shadow-card',
        hover && 'card-hover cursor-pointer',
        glow && 'animate-glow-pulse',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('font-cinzel text-ash-50 font-semibold text-lg leading-tight', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('text-ash-500 text-sm mt-1', className)}>
      {children}
    </p>
  )
}

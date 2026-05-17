import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-void-700 border border-void-500 flex items-center justify-center mb-5 text-ash-500">
          {icon}
        </div>
      )}
      <h3 className="font-cinzel text-lg text-ash-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-ash-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}

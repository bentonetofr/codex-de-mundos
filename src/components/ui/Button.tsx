'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const variants = {
  primary: `
    bg-amber text-void-950 font-semibold
    hover:bg-amber-light
    shadow-[0_0_20px_rgba(201,168,76,0.3)]
    hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]
    active:scale-[0.98]
  `,
  secondary: `
    bg-void-600 text-ash-50 border border-void-500
    hover:border-amber/40 hover:bg-void-500
  `,
  ghost: `
    bg-transparent text-ash-200
    hover:bg-void-700 hover:text-ash-50
  `,
  danger: `
    bg-red-900/30 text-red-400 border border-red-900/50
    hover:bg-red-900/50 hover:border-red-700
  `,
  outline: `
    bg-transparent text-amber border border-amber/40
    hover:bg-amber/10 hover:border-amber
  `,
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

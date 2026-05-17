import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const fieldBase = `
  w-full bg-void-700 border border-void-500 rounded-lg
  px-3 py-2 text-ash-50 text-sm
  placeholder:text-ash-500
  focus:outline-none focus:border-amber/50 focus:bg-void-600
  transition-colors duration-200
`

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-ash-200 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={cn(fieldBase, error && 'border-red-700', className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ash-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-ash-200 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={cn(fieldBase, 'resize-none min-h-[100px]', error && 'border-red-700', className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ash-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-ash-200 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={cn(fieldBase, 'cursor-pointer', error && 'border-red-700', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-void-700">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

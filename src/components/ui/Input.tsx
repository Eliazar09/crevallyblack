import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cream-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 border text-cream-100 placeholder:text-ink-500 font-sans text-sm transition-colors focus:outline-none',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-coffee-400/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helper && !error && <p className="text-xs text-ink-500">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cream-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 border text-cream-100 placeholder:text-ink-500 font-sans text-sm resize-none transition-colors focus:outline-none',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-coffee-400/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

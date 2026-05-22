import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'whatsapp'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold-400 text-forest-950 hover:bg-gold-300 active:scale-[0.98] font-semibold border border-gold-400/50',
  ghost:
    'bg-transparent text-cream-100 border border-white/20 hover:border-white/40 hover:bg-white/5 active:scale-[0.98]',
  outline:
    'bg-transparent text-forest-800 border border-forest-800/30 hover:border-forest-800/60 hover:bg-forest-800/5 active:scale-[0.98]',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1fb855] active:scale-[0.98] font-semibold',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, as, href, target, rel, ...props }, ref) => {
    const base = cn(
      'inline-flex items-center justify-center rounded-full font-sans tracking-wide transition-all duration-200 cursor-pointer select-none',
      variants[variant],
      sizes[size],
      className
    )

    if (as === 'a' && href) {
      const isInternal = href.startsWith('/')
      if (isInternal) {
        return (
          <Link to={href} className={base}>
            {children}
          </Link>
        )
      }
      return (
        <a href={href} target={target} rel={rel} className={base}>
          {children}
        </a>
      )
    }

    return (
      <button ref={ref} className={base} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

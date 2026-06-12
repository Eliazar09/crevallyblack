import type { ComponentPropsWithoutRef } from 'react'
import React from 'react'
import { motion } from 'framer-motion'

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'outline' | 'default' | 'secondary' | 'green'

type BaseProps = {
  children: React.ReactNode
  variant?: ButtonVariant
  className?: string
  glow?: boolean
  size?: number | string
  offset?: number
  hoverOffset?: number
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<typeof motion.button> & { as?: 'button'; href?: never }
type AnchorProps = BaseProps & Omit<ComponentPropsWithoutRef<typeof motion.a>, 'href'> & { as: 'link'; href: string; target?: string; rel?: string }
type FrameButtonProps = ButtonProps | AnchorProps

export function FrameButton({ children, className, variant = 'default', glow = false, size = 18, offset = 7.5, hoverOffset = 6, ...props }: FrameButtonProps) {
  const commonStyles = cn(
    'group relative inline-flex overflow-visible items-center justify-center',
    'border px-7 py-3.5',
    'cursor-pointer no-underline',
    'uppercase tracking-[0.18em]',
    'text-[12px] font-bold',
    'transition-all duration-300',
    'select-none',
    variant === 'default' && ['bg-ink-900 text-cream-50 border-ink-900', 'hover:bg-ink-700 hover:border-ink-700'],
    variant === 'secondary' && ['bg-transparent text-ink-900 border-ink-900/40', 'hover:bg-ink-900 hover:text-cream-50 hover:border-ink-900'],
    variant === 'outline' && ['bg-transparent text-cream-50 border-white/70', 'hover:bg-white/10 hover:border-white'],
    variant === 'green' && ['bg-[#25D366] text-white border-[#25D366]', 'hover:bg-[#1ebe5d] hover:border-[#1ebe5d]'],
    'active:scale-[0.985]',
    className,
  )

  const glowLayer = glow ? (
    <div className="absolute inset-0 -z-10 opacity-0 blur-2xl group-hover:opacity-40 group-hover:scale-110" style={{ background: 'currentColor' }} />
  ) : null

  const Content = (
    <>
      {glowLayer}
      {children}
      <FrameMarkers size={size} offset={offset} hoverOffset={hoverOffset} variant={variant} />
    </>
  )

  if (props.as === 'link') {
    const { as, href, target, rel, ...anchorProps } = props as AnchorProps
    return (
      <motion.a href={href} target={target} rel={rel} className={commonStyles} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }} {...(anchorProps as object)}>
        {Content}
      </motion.a>
    )
  }

  const { as, ...buttonProps } = props as ButtonProps
  return (
    <motion.button className={commonStyles} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }} {...(buttonProps as object)}>
      {Content}
    </motion.button>
  )
}

type IconProps = React.SVGProps<SVGSVGElement>

function ChevronDownLeft({ className, ...props }: IconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('absolute', className)} {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 8v8h8" /></svg>
}
function ChevronDownRight({ className, ...props }: IconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('absolute', className)} {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M16 8v8h-8" /></svg>
}
function ChevronUpLeft({ className, ...props }: IconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('absolute', className)} {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 16v-8h8" /></svg>
}
function ChevronUpRight({ className, ...props }: IconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('absolute', className)} {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M16 16v-8h-8" /></svg>
}

interface FrameMarkersProps { size?: number | string; offset?: number; hoverOffset?: number; variant?: ButtonVariant }

function FrameMarkers({ size = 18, offset = 7.5, hoverOffset = 6, variant }: FrameMarkersProps) {
  const px = (n: number) => `${n}px`
  const pos = px(hoverOffset)
  const markerColor =
    variant === 'outline'   ? 'text-white/60 group-hover:text-white' :
    variant === 'green'     ? 'text-white/60 group-hover:text-white' :
    variant === 'secondary' ? 'text-ink-900/40 group-hover:text-white' :
    'text-white/50 group-hover:text-white/90'
  const base = `pointer-events-none transition-all duration-300 ease-out ${markerColor}`
  const w = typeof size === 'number' ? size : 18
  const s = { width: w, height: w }
  return (
    <>
      <ChevronUpLeft    style={{ ...s, top: `-${offset}px`, left:  `-${offset}px` }} className={`${base} group-hover:-translate-x-[${pos}] group-hover:-translate-y-[${pos}]`} />
      <ChevronUpRight   style={{ ...s, top: `-${offset}px`, right: `-${offset}px` }} className={`${base} group-hover:translate-x-[${pos}] group-hover:-translate-y-[${pos}]`} />
      <ChevronDownRight style={{ ...s, bottom: `-${offset}px`, right: `-${offset}px` }} className={`${base} group-hover:translate-x-[${pos}] group-hover:translate-y-[${pos}]`} />
      <ChevronDownLeft  style={{ ...s, bottom: `-${offset}px`, left:  `-${offset}px` }} className={`${base} group-hover:-translate-x-[${pos}] group-hover:translate-y-[${pos}]`} />
    </>
  )
}

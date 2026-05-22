import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function useScrollReveal(options?: { once?: boolean; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: options?.margin ?? '0px 0px -80px 0px',
  } as Parameters<typeof useInView>[1])

  return { ref, isInView }
}

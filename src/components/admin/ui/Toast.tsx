import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToast } from '../../../hooks/useToast'
import { cn } from '../../../lib/cn'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}
const colors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
}

export function ToastContainer() {
  const { toasts, remove } = useToast()
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 bg-forest-900 border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
            >
              <Icon size={16} className={cn('mt-0.5 flex-shrink-0', colors[t.type])} />
              <p className="text-sm text-cream-100 flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-ink-500 hover:text-cream-200 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

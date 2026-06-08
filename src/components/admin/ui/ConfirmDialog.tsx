import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../ui/Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open, title, description, confirmLabel = 'Eliminar',
  onConfirm, onCancel, loading
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={open} onClose={onCancel} title="">
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-cream-100 mb-1">{title}</p>
            <p className="text-sm text-ink-500">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm text-ink-400 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500/90 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

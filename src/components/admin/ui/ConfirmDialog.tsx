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
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { buildWhatsAppLink, type CustomerData } from '../../lib/whatsapp'

interface CheckoutFormProps {
  onBack: () => void
  onClose: () => void
}

export function CheckoutForm({ onBack, onClose }: CheckoutFormProps) {
  const { items, clearCart } = useCart()
  const [errors, setErrors] = useState<Partial<CustomerData>>({})
  const [form, setForm] = useState<CustomerData>({
    nombre: '',
    telefono: '',
    ciudad: '',
  })

  function validate(): boolean {
    const newErrors: Partial<CustomerData> = {}
    if (!form.nombre.trim()) newErrors.nombre = 'Requerido'
    if (!form.telefono.trim()) newErrors.telefono = 'Requerido'
    if (!form.ciudad.trim()) newErrors.ciudad = 'Requerida'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleChange(field: keyof CustomerData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit() {
    if (!validate()) return
    const link = buildWhatsAppLink(items, form)
    const opened = window.open(link, '_blank')
    if (opened) {
      clearCart()
      onClose()
    } else {
      alert('Por favor, permite las ventanas emergentes (popups) para abrir WhatsApp.')
    }
  }

  return (
    <div className="p-5 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-ink-500 hover:text-cream-200 transition-colors"
      >
        <ArrowLeft size={14} />
        Volver al carrito
      </button>

      <div>
        <p className="font-display text-base font-semibold text-cream-100 mb-1">Datos de contacto</p>
        <p className="text-xs text-ink-500">Solo 3 datos y te enviamos el pedido por WhatsApp.</p>
      </div>

      <Input
        label="Nombre completo"
        value={form.nombre}
        onChange={handleChange('nombre')}
        error={errors.nombre}
        placeholder="Ej: Mariela Rodríguez"
      />

      <Input
        label="Teléfono"
        type="tel"
        value={form.telefono}
        onChange={handleChange('telefono')}
        error={errors.telefono}
        placeholder="+58 412 000 0000"
      />

      <Input
        label="Ciudad"
        value={form.ciudad}
        onChange={handleChange('ciudad')}
        error={errors.ciudad}
        placeholder="Ej: Caracas, Valencia, Maracaibo..."
      />

      <div className="pt-1">
        <Button
          onClick={handleSubmit}
          size="md"
          variant="whatsapp"
          className="w-full justify-center"
        >
          <MessageCircle size={16} strokeWidth={2} />
          Enviar pedido por WhatsApp
        </Button>
        <p className="text-center text-[11px] text-ink-500 mt-3">
          Te contactaremos para coordinar el pago y la entrega.
        </p>
      </div>
    </div>
  )
}

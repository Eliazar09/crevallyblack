import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Leaf } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-forest-950 flex flex-col items-center justify-center gap-6 px-4 text-center">
      <Helmet>
        <title>Página no encontrada — GreenLife</title>
      </Helmet>

      <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
        <Leaf size={20} strokeWidth={1.5} className="text-gold-400" />
      </div>

      <div className="space-y-2">
        <p className="font-mono text-sm text-gold-400 uppercase tracking-widest">404</p>
        <h1 className="font-display text-3xl font-light text-cream-50">
          Página no encontrada
        </h1>
        <p className="text-sm text-ink-500 max-w-[36ch] leading-relaxed">
          La página que buscas no existe o fue movida.
          Regresa al inicio o explora el catálogo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          to="/tienda"
          className="px-6 py-3 rounded-full border border-white/20 text-cream-100 font-medium text-sm hover:border-white/40 hover:bg-white/5 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}

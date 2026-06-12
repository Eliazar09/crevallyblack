import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Shirt } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-ink-900 flex flex-col items-center justify-center gap-6 px-4 text-center">
      <Helmet>
        <title>Página não encontrada — Crevally Black</title>
      </Helmet>

      <div className="w-12 h-12 rounded-full bg-coffee-400/10 border border-coffee-400/30 flex items-center justify-center">
        <Shirt size={20} strokeWidth={1.5} className="text-coffee-400" />
      </div>

      <div className="space-y-2">
        <p className="font-mono text-sm text-coffee-400 uppercase tracking-widest">404</p>
        <h1 className="font-display text-3xl font-light text-cream-50">
          Página não encontrada
        </h1>
        <p className="text-sm text-ink-400 max-w-[36ch] leading-relaxed">
          A página que você procura não existe ou foi movida.
          Volte ao início ou explore o catálogo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-coffee-400 text-white font-semibold text-sm hover:bg-coffee-300 transition-colors"
        >
          Voltar ao início
        </Link>
        <Link
          to="/loja"
          className="px-6 py-3 rounded-full border border-white/20 text-cream-100 font-medium text-sm hover:border-white/40 hover:bg-white/5 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}

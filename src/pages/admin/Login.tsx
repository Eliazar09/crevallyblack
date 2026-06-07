import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-forest-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
            <Leaf size={20} className="text-gold-400" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-medium text-cream-50">GreenLife Admin</p>
            <p className="text-xs text-ink-500 mt-0.5">Panel de gestión</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-forest-900/60 border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-ink-500 uppercase tracking-wider">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@greenlife.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-cream-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-ink-500 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-cream-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-cream-200"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 disabled:opacity-60 transition-colors active:scale-[0.98]"
          >
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

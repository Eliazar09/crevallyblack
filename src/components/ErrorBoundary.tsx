import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-forest-950 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-display text-2xl font-light text-cream-50">
            Algo salió mal
          </p>
          <p className="text-sm text-ink-500 max-w-[36ch] leading-relaxed">
            Ocurrió un error inesperado. Por favor recarga la página o escríbenos por WhatsApp.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 transition-colors"
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

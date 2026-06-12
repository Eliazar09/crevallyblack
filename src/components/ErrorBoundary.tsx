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
        <div className="min-h-[100dvh] bg-ink-900 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-display text-2xl font-light text-cream-50">
            Algo deu errado
          </p>
          <p className="text-sm text-ink-500 max-w-[36ch] leading-relaxed">
            Ocorreu um erro inesperado. Por favor recarregue a página ou entre em contato pelo WhatsApp.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-coffee-400 text-ink-900 font-semibold text-sm hover:bg-coffee-300 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

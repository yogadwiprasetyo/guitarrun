import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State { return { error } }
  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught', error)
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Something broke.</h1>
          <p className="text-ink/60 mb-6">That's on us. Refresh to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-ink text-paper text-sm"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

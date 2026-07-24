import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Munroe UI crash', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      const message = String(this.state.error?.message || this.state.error || 'Unknown UI error')
      return (
        <div style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0d0d0f',
          color: '#ececea',
          fontFamily: 'Inter, -apple-system, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ color: '#c9a84c', letterSpacing: '0.2em', fontSize: 11, marginBottom: 12 }}>MUNROE CODE</div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 8px' }}>Something went wrong</h1>
            <p style={{ color: '#88888c', fontSize: 13, lineHeight: 1.5 }}>
              The chat UI hit an unexpected error. Your project and API keys are fine — reload and continue the conversation.
            </p>
            <pre style={{
              textAlign: 'left',
              background: '#141418',
              border: '1px solid #1f1f23',
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              color: '#d97373',
              overflow: 'auto',
              maxHeight: 180,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {message}
            </pre>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                style={{
                  background: 'transparent',
                  color: '#ececea',
                  border: '1px solid #303035',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try recover
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#c9a84c',
                  color: '#0d0d0f',
                  border: 0,
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload Munroe Code
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in the component tree and displays
 * a fallback UI instead of crashing the whole app.
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. You can try resetting the view or
              refreshing the page.
            </p>
            {this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div style={styles.buttons}>
              <button
                onClick={this.handleReset}
                style={styles.button}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
  },
  content: {
    maxWidth: '500px',
    padding: '2rem',
    backgroundColor: '#16213e',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    color: '#e0e0e0',
    textAlign: 'center' as const,
  },
  title: {
    marginTop: 0,
    marginBottom: '1rem',
    fontSize: '1.5rem',
    color: '#ff6b6b',
  },
  message: {
    marginBottom: '1.5rem',
    lineHeight: 1.6,
    color: '#a0a0a0',
  },
  details: {
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
  },
  summary: {
    cursor: 'pointer',
    padding: '0.5rem',
    backgroundColor: '#0f3460',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  errorText: {
    padding: '1rem',
    backgroundColor: '#0a0a0a',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: '0.75rem',
    color: '#ff6b6b',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    textAlign: 'left' as const,
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#e94560',
    color: 'white',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: '#0f3460',
  },
}

export default ErrorBoundary

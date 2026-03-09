import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import logger from '../utils/logger'
import { captureComponentError } from '../utils/errorTracking'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    logger.error('ErrorBoundary caught:', error, errorInfo)
    captureComponentError(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            minHeight: '20rem',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--color-error)' }} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            {'Something went wrong'}
          </h2>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              maxWidth: '24rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            {'An unexpected error occurred. Try refreshing the view or navigating to a different section.'}
          </p>

          <button
            onClick={this.handleReset}
            className="btn-primary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}
          >
            <RefreshCw size={14} />
            {'Try Again'}
          </button>

        </div>
      )
    }

    return this.props.children
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n' // Initialize i18next before any component renders
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/Toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/AEO-Dashboard/sw.js').catch(() => {
      // Silently fail in dev mode or unsupported environments
    })
  })
}

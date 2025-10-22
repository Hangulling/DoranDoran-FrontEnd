import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import React from 'react'
import ReactGA from 'react-ga4'
import AnalyticsTracker from './components/common/AnalyticsTracker.tsx'

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID
const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'

if (import.meta.env.PROD && GA_TRACKING_ID && GA_ENABLED) {
  ReactGA.initialize(GA_TRACKING_ID)
  console.log('[GA] Production GA Initialized')
} else {
  console.warn('[GA] GA not initialized (Disabled, Dev mode, or no Tracking ID)')
}

const isDev = import.meta.env.DEV
const USE_MSW = import.meta.env.VITE_USE_MSW === 'false'

const prepare = async () => {
  if (isDev && USE_MSW) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }
}

prepare().then(() => {
  const container = document.getElementById('root')!
  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AnalyticsTracker />
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
})

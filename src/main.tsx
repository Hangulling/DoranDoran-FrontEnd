import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import React from 'react'
import ReactGA from 'react-ga4'
import AnalyticsTracker from './components/common/AnalyticsTracker.tsx'

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID

if (GA_TRACKING_ID) {
  ReactGA.initialize(GA_TRACKING_ID)
} else {
  console.warn('[GA] Tracking ID가 .env 파일에 설정되지 않았습니다.')
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

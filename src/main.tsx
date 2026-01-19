import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import React from 'react'
import MaintenancePage from './pages/MaintenancePage.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './constants/env'
import { isNativeApp } from './utils/isNativeApp.ts'
import { SocialLogin } from '@capgo/capacitor-social-login'

const IS_MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

const urlParams = new URLSearchParams(window.location.search)
const paramInternal = urlParams.get('internal') === 'true'

if (isNativeApp()) {
  SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_CLIENT_ID,
      iOSClientId: GOOGLE_CLIENT_ID,
      iOSServerClientId: GOOGLE_CLIENT_ID,
    },
  })
}

if (paramInternal) {
  sessionStorage.setItem('isInternalTraffic', 'true')
}

const isDev = import.meta.env.DEV
const USE_MSW = import.meta.env.VITE_USE_MSW === 'true' // 환경변수에 false 변경

const prepare = async () => {
  if (isDev && USE_MSW) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }
}

const queryClient = new QueryClient()
console.log('✅ GOOGLE_CLIENT_ID from env:', GOOGLE_CLIENT_ID)

prepare().then(() => {
  const container = document.getElementById('root')!
  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        {IS_MAINTENANCE_MODE ? (
          <Routes>
            <Route path="*" element={<MaintenancePage />} />
          </Routes>
        ) : (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </GoogleOAuthProvider>
        )}
      </BrowserRouter>
    </React.StrictMode>
  )
})

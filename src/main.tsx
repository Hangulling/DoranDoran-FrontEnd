import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import React from 'react'
import MaintenancePage from './pages/MaintenancePage.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { isNativeApp } from './utils/isNativeApp.ts'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from './constants/env'

const IS_MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

const urlParams = new URLSearchParams(window.location.search)
const paramInternal = urlParams.get('internal') === 'true'

const isNative = isNativeApp()

if (isNative) {
  SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
      iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
    },
  })
}

if (paramInternal) {
  sessionStorage.setItem('isInternalTraffic', 'true')
}

const isDev = import.meta.env.DEV
const USE_MSW = import.meta.env.VITE_USE_MSW === 'true'

const prepare = async () => {
  if (isDev && USE_MSW) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }
}

const queryClient = new QueryClient()

console.log('✅ isNative:', isNative)
console.log('✅ GOOGLE_WEB_CLIENT_ID:', GOOGLE_WEB_CLIENT_ID)
console.log('✅ GOOGLE_IOS_CLIENT_ID:', GOOGLE_IOS_CLIENT_ID)

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
        ) : isNative ? (
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        ) : (
          <GoogleOAuthProvider clientId={GOOGLE_WEB_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </GoogleOAuthProvider>
        )}
      </BrowserRouter>
    </React.StrictMode>
  )
})

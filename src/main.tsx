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
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  APPLE_CLIENT_ID,
} from './constants/env'

const IS_MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

const urlParams = new URLSearchParams(window.location.search)
const paramInternal = urlParams.get('internal') === 'true'
if (paramInternal) {
  sessionStorage.setItem('isInternalTraffic', 'true')
}

const isInternalTraffic = sessionStorage.getItem('isInternalTraffic') === 'true'
const isDev = import.meta.env.DEV

const shouldVerboseLog = isDev || isInternalTraffic

const logError = (title: string, err?: unknown) => {
  if (shouldVerboseLog) {
    console.error(title, err)
  } else {
    console.error(title)
  }
}

const logWarn = (title: string, extra?: unknown) => {
  if (shouldVerboseLog) {
    console.warn(title, extra)
  } else {
    console.warn(title)
  }
}

const isNative = isNativeApp()

if (isNative) {
  if (!GOOGLE_WEB_CLIENT_ID || !GOOGLE_IOS_CLIENT_ID) {
    if (shouldVerboseLog) {
      logWarn('Google Client ID missing', {
        web: GOOGLE_WEB_CLIENT_ID,
        ios: GOOGLE_IOS_CLIENT_ID,
      })
    } else {
      logWarn('Google Client ID missing')
    }
  } else {
    try {
      SocialLogin.initialize({
        google: {
          webClientId: GOOGLE_WEB_CLIENT_ID,
          iOSClientId: GOOGLE_IOS_CLIENT_ID,
          iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
        },
        apple: {
          clientId: APPLE_CLIENT_ID,
        },
      })
    } catch (e: unknown) {
      logError('SocialLogin init failed', e)
    }
  }
}

const USE_MSW = import.meta.env.VITE_USE_MSW === 'true'

const prepare = async () => {
  if (isDev && USE_MSW) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }
}

const queryClient = new QueryClient()

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

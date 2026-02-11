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
  if (shouldVerboseLog) console.error(title, err)
  else console.error(title)
}

const logWarn = (title: string, extra?: unknown) => {
  if (shouldVerboseLog) console.warn(title, extra)
  else console.warn(title)
}

const isNative = isNativeApp()

const initSocialLogin = async () => {
  if (!isNative) return

  try {
    if (shouldVerboseLog) {
      logWarn('SocialLogin env', {
        apple: APPLE_CLIENT_ID,
        googleWeb: GOOGLE_WEB_CLIENT_ID,
        googleIos: GOOGLE_IOS_CLIENT_ID,
      })
    }

    await SocialLogin.initialize({
      apple: APPLE_CLIENT_ID
        ? {
            clientId: APPLE_CLIENT_ID,
            // redirectUrl: 'https://api.doran-chat.com/api/auth/oauth/callback', // AOS
          }
        : {},
      ...(GOOGLE_WEB_CLIENT_ID && GOOGLE_IOS_CLIENT_ID
        ? {
            google: {
              webClientId: GOOGLE_WEB_CLIENT_ID,
              iOSClientId: GOOGLE_IOS_CLIENT_ID,
              iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
            },
          }
        : {}),
    })

    if (!GOOGLE_WEB_CLIENT_ID || !GOOGLE_IOS_CLIENT_ID) {
      logWarn(
        'Google Client ID missing',
        shouldVerboseLog
          ? { web: GOOGLE_WEB_CLIENT_ID, ios: GOOGLE_IOS_CLIENT_ID }
          : undefined
      )
    }
  } catch (e: unknown) {
    logError('SocialLogin init failed', e)
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

prepare()
  .then(async () => {
    await initSocialLogin()
  })
  .then(() => {
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

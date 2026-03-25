import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom'
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
import { tokenService } from './api/tokenService.ts'
import { initGA } from './utils/ga.ts'
import { Capacitor } from '@capacitor/core'
import { checkMaintenanceMode } from './utils/firebase.ts'

const isDev = import.meta.env.DEV
const shouldVerboseLog = isDev

const logError = (title: string, err?: unknown) => {
  if (shouldVerboseLog) console.error(title, err)
  else console.error(title)
}

const logWarn = (title: string, extra?: unknown) => {
  if (shouldVerboseLog) console.warn(title, extra)
  else console.warn(title)
}

const isNative = isNativeApp()

const Router = isNative ? HashRouter : BrowserRouter

const initSocialLogin = async () => {
  if (!isNative) return

  try {
    const platform = Capacitor.getPlatform()

    if (shouldVerboseLog) {
      logWarn('SocialLogin env', {
        platform,
        apple: APPLE_CLIENT_ID,
        googleWeb: GOOGLE_WEB_CLIENT_ID,
        googleIos: GOOGLE_IOS_CLIENT_ID,
      })
    }

    await SocialLogin.initialize({
      ...(platform === 'ios' && APPLE_CLIENT_ID
        ? {
            clientId: APPLE_CLIENT_ID,
            redirectUrl: 'https://api.doran-chat.com/api/auth/oauth/callback',
          }
        : {}),
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
    initGA()
    await tokenService.hydrate()
    await initSocialLogin()
    // 점검 모드 확인
    const isMaintenance = await checkMaintenanceMode()
    return isMaintenance
  })
  .then(isMaintenance => {
    const container = document.getElementById('root')!
    const root = ReactDOM.createRoot(container)

    root.render(
      <React.StrictMode>
        <Router>
          {isMaintenance ? (
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
        </Router>
      </React.StrictMode>
    )
  })

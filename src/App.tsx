import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import { App as CapacitorApp } from '@capacitor/app'
import { useLocation, useNavigate } from 'react-router-dom'
import usePushNotification from './hooks/usePushNotification'
import { useEmailVerifiedDeepLink } from './hooks/useEmailVerifiedDeepLink'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isChatPage = location.pathname.startsWith('/chat/')

  usePushNotification()
  useEmailVerifiedDeepLink()

  useEffect(() => {
    const setupBackButtonListener = async () => {
      const listener = await CapacitorApp.addListener('backButton', () => {
        // 앱 종료 경로
        const exitRoutes = ['/', '/login', '/login/email', '/onboarding']

        if (
          exitRoutes.includes(location.pathname) ||
          location.pathname === '/'
        ) {
          CapacitorApp.exitApp()
        } else {
          // 그 외의 경우 뒤로가기
          navigate(-1)
        }
      })

      return listener
    }
    const listenerPromise = setupBackButtonListener()

    return () => {
      listenerPromise.then(listener => listener.remove())
    }
  }, [navigate, location])

  return (
    <div className="relative flex flex-col h-dvh mx-auto w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-white">
      <Toaster position="bottom-center" />
      {isChatPage ? (
        <>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes />
          </Suspense>
          <div id="chat-footer-portal" />
        </>
      ) : (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes />
          </Suspense>
        </AppLayout>
      )}
    </div>
  )
}

export default App

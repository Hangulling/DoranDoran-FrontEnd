import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import { App as CapacitorApp } from '@capacitor/app'
import { useLocation, useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

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

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      listenerPromise.then(listener => listener.remove())
    }
  }, [navigate, location]) // location이 바뀔 때마다 리스너를 갱신하여 최신 경로 감지

  return (
    <div className="relative flex flex-col h-dvh mx-auto w-full max-w-md bg-white">
      <Toaster position="bottom-center" />
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes />
        </Suspense>
      </AppLayout>
    </div>
  )
}

export default App

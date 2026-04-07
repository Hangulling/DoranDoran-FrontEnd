import { Suspense } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import usePushNotification from './hooks/usePushNotification'
import { useEmailVerifiedDeepLink } from './hooks/useEmailVerifiedDeepLink'
import { useFetchUser } from './hooks/useFetchUser'

function App() {
  usePushNotification()
  useEmailVerifiedDeepLink()

  useFetchUser()

  return (
    <div
      id="app-scroll"
      className="relative flex flex-col h-dvh mx-auto w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-white"
    >
      <Toaster
        containerStyle={{
          bottom: 'env(safe-area-inset-bottom)',
        }}
      />
      {
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes />
          </Suspense>
        </AppLayout>
      }
    </div>
  )
}

export default App

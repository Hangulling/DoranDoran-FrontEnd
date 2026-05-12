import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import usePushNotification from './hooks/usePushNotification'
import { useEmailVerifiedDeepLink } from './hooks/useEmailVerifiedDeepLink'
import { SocialLogin } from '@capgo/capacitor-social-login'

function App() {
  usePushNotification()
  useEmailVerifiedDeepLink()

  useEffect(() => {
    const initMetaSDK = async (): Promise<void> => {
      try {
        await SocialLogin.initialize({
          facebook: {
            appId: '2822743828076251', // 💡 메타 대시보드의 앱 ID
            clientToken: '02fd34801dbb3e5344d7b0b3a41131a3', // 💡 [설정 > 고급 설정]에서 확인 가능
          },
        })
        console.log('Meta SDK 초기화 완료')
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        console.error('Meta SDK Init Failed:', errorMessage)
      }
    }

    initMetaSDK()
  }, [])

  return (
    <div
      id="app-scroll"
      className="relative flex flex-col h-dvh mx-auto w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-white"
    >
      <Toaster
        containerClassName="pointer-events-none"
        containerStyle={{
          bottom: 'env(safe-area-inset-bottom)',
        }}
      />
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes />
        </Suspense>
      </AppLayout>
    </div>
  )
}

export default App

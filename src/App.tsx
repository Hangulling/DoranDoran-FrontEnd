import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'

function App() {
  useEffect(() => {
    const setAppHeight = () => {
      const appHeight = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${appHeight}px`)
    }

    window.visualViewport?.addEventListener('resize', setAppHeight)
    setAppHeight()
    return () => {
      window.visualViewport?.removeEventListener('resize', setAppHeight)
    }
  }, [])

  return (
    <div
      className="relative mx-auto w-full max-w-md bg-white h-screen flex flex-col"
      style={{ height: 'var(--app-height, 100vh)' }}
    >
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

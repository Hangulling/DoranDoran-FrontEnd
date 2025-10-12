import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'

function App() {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = (window.visualViewport?.height ?? window.innerHeight) * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setViewportHeight()
    window.visualViewport?.addEventListener('resize', setViewportHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', setViewportHeight)
    }
  }, [])

  return (
    <div className="relative flex flex-col mx-auto w-full max-w-md bg-white h-[calc(var(--vh,1vh)*100)]">
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

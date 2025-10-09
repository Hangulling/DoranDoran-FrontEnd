import { Suspense, useEffect } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import Div100vh from 'react-div-100vh'

function App() {
  useEffect(() => {
    const setViewportHeight = () => {
      const height = window.visualViewport ? window.visualViewport.height : window.innerHeight
      const vh = height * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setViewportHeight()

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight)
      window.visualViewport.addEventListener('scroll', setViewportHeight)
    } else {
      window.addEventListener('resize', setViewportHeight)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight)
        window.visualViewport.removeEventListener('scroll', setViewportHeight)
      } else {
        window.removeEventListener('resize', setViewportHeight)
      }
    }
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-md bg-white h-[calc(var(--vh,1vh)*100)]">
      <Toaster position="bottom-center" />
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes />
        </Suspense>
      </AppLayout>
    </Div100vh>
  )
}

export default App

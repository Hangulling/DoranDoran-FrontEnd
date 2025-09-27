import { Suspense } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="relative mx-auto w-full max-w-md min-h-screen bg-white">
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

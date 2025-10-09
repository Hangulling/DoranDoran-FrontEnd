import { Suspense } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'
import { Toaster } from 'react-hot-toast'
import Div100vh from 'react-div-100vh'

function App() {
  return (
    <Div100vh className="relative mx-auto w-full max-w-md bg-white">
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

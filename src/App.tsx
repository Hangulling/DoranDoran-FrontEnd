import { Suspense } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/common/LoadingSpinner'
import AppLayout from './layouts/AppLayout'

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes />
      </Suspense>
    </AppLayout>
  )
}

export default App

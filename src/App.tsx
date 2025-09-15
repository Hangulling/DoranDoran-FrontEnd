import { Suspense } from 'react'
import { Routes } from './router/routes'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes />
    </Suspense>
  )
}

export default App

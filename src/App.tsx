import { Suspense } from 'react'
import { Routes } from './router/routes'

function App() {
  return (
    <Suspense>
      <Routes />
    </Suspense>
  )
}

export default App

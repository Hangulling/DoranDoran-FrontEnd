import { lazy } from 'react'
import { Route, Routes as RouterRoutes } from 'react-router-dom'

const MainPage = lazy(() => import('../pages/MainPage'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPage />} />
    </RouterRoutes>
  )
}

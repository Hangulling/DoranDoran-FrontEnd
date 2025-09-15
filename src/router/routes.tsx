import { lazy } from 'react'
import { Route, Routes as RouterRoutes } from 'react-router-dom'

const ListPage = lazy(() => import('../pages/ListPage'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<ListPage />} />
    </RouterRoutes>
  )
}

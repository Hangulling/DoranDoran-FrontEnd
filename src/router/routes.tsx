import { lazy } from 'react'
import { Route, Routes as RouterRoutes } from 'react-router-dom'

const MainPage = lazy(() => import('../pages/MainPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </RouterRoutes>
  )
}

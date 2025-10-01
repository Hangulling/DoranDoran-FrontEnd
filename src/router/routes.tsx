import { lazy } from 'react'
import { Route, Routes as RouterRoutes } from 'react-router-dom'

const MainPage = lazy(() => import('../pages/MainPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))
const ArchivePage = lazy(() => import('../pages/ArchivePage'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat/:id" element={<ChatPage messages={[]} />} />
      <Route path="/archive" element={<ArchivePage />} />
    </RouterRoutes>
  )
}

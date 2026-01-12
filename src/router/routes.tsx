import { lazy } from 'react'
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import FindEmailForm from '../pages/find-email/FindEmailForm'
import FindEmailNotFound from '../pages/find-email/FindEmailNotFound'
import FindEmailSuccess from '../pages/find-email/FindEmailSuccess'
import FindPasswordEmail from '../pages/find-passoword/FindPasswordEmail'
import FindPasswordVerify from '../pages/find-passoword/FindPasswordVerify'
import FindPasswordReset from '../pages/find-passoword/FindPasswordReset'

const MainPage = lazy(() => import('../pages/MainPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ClosenessPage = lazy(() => import('../pages/ClosenessPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))
const ArchivePage = lazy(() => import('../pages/ArchivePage'))
const PolicyPage = lazy(() => import('../pages/PolicyPage'))
const ErrorPage = lazy(() => import('../pages/ErrorPage'))
const TestMainPage = lazy(() => import('../test/TestMainPage'))
const TestClosenessPage = lazy(() => import('../test/TestClosenessPage'))
const TestChatPage = lazy(() => import('../test/TestChatPage'))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'))
const FindEmailPage = lazy(() => import('../pages/find-email/FindEmailPage'))
const FindPasswordPage = lazy(
  () => import('../pages/find-passoword/FindPasswordPage')
)

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Test routes */}
      <Route
        path="/test/chat/:model"
        element={
          <PrivateRoute>
            <TestMainPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/test/closeness/:model/:id"
        element={
          <PrivateRoute>
            <TestClosenessPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/test/chat/:model/:id"
        element={
          <PrivateRoute>
            <TestChatPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/closeness/:id"
        element={
          <PrivateRoute>
            <ClosenessPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/archive/:id"
        element={
          <PrivateRoute>
            <ArchivePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <PrivateRoute>
            <OnboardingPage />
          </PrivateRoute>
        }
      />
      <Route path="/policy/:id" element={<PolicyPage />} />
      <Route path="/find-email" element={<FindEmailPage />}>
        <Route index element={<Navigate to="form" replace />} />
        <Route path="form" element={<FindEmailForm />} />
        <Route path="not-found" element={<FindEmailNotFound />} />
        <Route path="success" element={<FindEmailSuccess />} />
      </Route>
      <Route path="/find-password" element={<FindPasswordPage />}>
        <Route index element={<Navigate to="email" replace />} />
        <Route path="email" element={<FindPasswordEmail />} />
        <Route path="verify" element={<FindPasswordVerify />} />
        <Route path="reset" element={<FindPasswordReset />} />
      </Route>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage errorCode={404} />} />
    </RouterRoutes>
  )
}

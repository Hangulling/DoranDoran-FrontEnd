import { lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import FindEmailNotFound from '../pages/find-email/FindEmailNotFound'
import FindEmailSuccess from '../pages/find-email/FindEmailSuccess'
import FindPasswordEmail from '../pages/find-password/FindPasswordEmail'
import FindPasswordVerify from '../pages/find-password/FindPasswordVerify'
import FindPasswordReset from '../pages/find-password/FindPasswordReset'
import SignupTerm from '../pages/signup/steps/SignupTerm'
import SignupEmail from '../pages/signup/steps/SignupEmail'
import SignupPassword from '../pages/signup/steps/SignupPassword'
import SignupName from '../pages/signup/steps/SignupName'
import SignupQuestion from '../pages/signup/steps/SignupQuestion'
import SignupBirthDate from '../pages/signup/steps/SignupBirthDate'
import FindEmailName from '../pages/find-email/steps/FindEmailName'
import FindEmailBirthDate from '../pages/find-email/steps/FindEmailBirthDate'
import FindEmailQuestion from '../pages/find-email/steps/FindEmailQuestion'
import LoginEmailPage from '../pages/LoginEmailPage'
import ProfilePage from '../pages/ProfilePage'

const MainPage = lazy(() => import('../pages/MainPage'))
const InstaPage = lazy(() => import('../pages/InstaPage'))
const SignupPage = lazy(() => import('../pages/signup/SignupPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const MyPage = lazy(() => import('../pages/MyPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))
const ArchivePage = lazy(() => import('../pages/ArchivePage'))
const PolicyPage = lazy(() => import('../pages/PolicyPage'))
const ErrorPage = lazy(() => import('../pages/ErrorPage'))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'))
const FindEmailPage = lazy(() => import('../pages/find-email/FindEmailPage'))
const FindPasswordPage = lazy(
  () => import('../pages/find-password/FindPasswordPage')
)

export function Routes() {
  return (
    <ErrorBoundary fallback={<ErrorPage errorCode={500} />}>
      <RouterRoutes>
        <Route path="/signup" element={<SignupPage />}>
          <Route index element={<Navigate to="term" replace />} />
          <Route path="term" element={<SignupTerm />} />
          <Route path="name" element={<SignupName />} />
          <Route path="birthdate" element={<SignupBirthDate />} />
          <Route path="email" element={<SignupEmail />} />
          <Route path="password" element={<SignupPassword />} />
          <Route path="question" element={<SignupQuestion />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email" element={<LoginEmailPage />} />
        <Route path="/mypage">
          <Route index element={<MyPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/insta/:externalId"
          element={
            <PrivateRoute>
              <InstaPage />
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
          <Route index element={<Navigate to="name" replace />} />
          <Route path="name" element={<FindEmailName />} />
          <Route path="birthdate" element={<FindEmailBirthDate />} />
          <Route path="question" element={<FindEmailQuestion />} />
          <Route path="not-found" element={<FindEmailNotFound />} />
          <Route path="success" element={<FindEmailSuccess />} />
        </Route>
        <Route path="/find-password" element={<FindPasswordPage />}>
          <Route index element={<Navigate to="email" replace />} />
          <Route path="email" element={<FindPasswordEmail />} />
          <Route path="verify" element={<FindPasswordVerify />} />
          <Route path="reset" element={<FindPasswordReset />} />
        </Route>
        <Route path="/error" element={<ErrorPage errorCode={500} />} />
        <Route path="*" element={<ErrorPage errorCode={404} />} />
      </RouterRoutes>
    </ErrorBoundary>
  )
}

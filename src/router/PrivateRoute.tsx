import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { tokenService } from '../api/tokenService'
import { useUserStore } from '../stores/useUserStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

interface PrivateRouteProps {
  children: JSX.Element
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const access = tokenService.access
  const refresh = tokenService.refresh

  const { isOnboard, isLoaded } = useUserStore() // 온보딩, 데이터 로드 상태 확인
  const hasToken = !!access || !!refresh

  if (!hasToken) {
    console.log('No token found, redirecting to login.')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    )
  }

  // 온보딩 미완료시 온보딩 페이지
  if (!isOnboard && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

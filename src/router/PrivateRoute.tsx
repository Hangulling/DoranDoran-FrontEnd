import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { tokenService } from '../api/tokenService'

interface PrivateRouteProps {
  children: JSX.Element
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const access = tokenService.access
  const refresh = tokenService.refresh

  const hasToken = !!access || !!refresh

  if (!hasToken) {
    console.log('No token found, redirecting to login.')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

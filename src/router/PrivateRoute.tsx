import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface PrivateRouteProps {
  children: JSX.Element
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const token = localStorage.getItem('accessToken')

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

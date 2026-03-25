import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ErrorPageProps, FromPage } from '../types/common'
import { sendGAEvent } from '../utils/ga'

export function useErrorPage({ errorCode }: ErrorPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const state =
    (location.state as { code?: number; from?: FromPage } | undefined) || {}

  const code = errorCode ?? state.code ?? 400

  // 500 에러에서 새로고침
  useEffect(() => {
    const isServerError = code >= 500
    const isRefreshOrDirect = location.state === null

    if (isServerError && isRefreshOrDirect) {
      navigate('/', { replace: true })
    }
  }, [location.state, navigate, code])

  // Go Back
  const from =
    state.from ||
    (location.pathname.startsWith('/signup') ? 'signup' : undefined)

  const backTarget = from === 'signup' ? '/signup' : '/'

  const handleClickBack = () => {
    // ga_click_error_action
    sendGAEvent('click_error_action')
    navigate(backTarget, { replace: true })
  }

  return { code, handleClickBack }
}

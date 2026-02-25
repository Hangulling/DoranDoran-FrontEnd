import axios from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  OAuthLoginRequest,
  OAuthLoginResponse,
  ResetPasswordRequest,
  VerificationRequest,
  VerifyCodeRequest,
} from '../types/auth'
import api, { publicApi } from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'
import { tokenService } from './tokenService'

let currentUserId: string | null = null

export async function login(data: LoginRequest) {
  const res = await publicApi.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
  const payload = res.data
  const resData = payload?.data ?? payload

  const accessToken = resData?.accessToken
  const refreshToken = resData?.refreshToken

  await tokenService.setTokens({ accessToken, refreshToken })
  await tokenService.setManualLogout(false)

  return res.data
}

export async function oauthLogin(data: OAuthLoginRequest) {
  const res = await publicApi.post<OAuthLoginResponse>(
    AUTH_ENDPOINTS.OAUTH_LOGIN,
    data
  )

  const payload = res.data
  const resData = payload?.data ?? payload

  const accessToken = resData?.accessToken
  const refreshToken = resData?.refreshToken
  const needSignup = resData?.needSignup

  console.log('[oauthLogin parsed]', {
    needSignup,
    hasAccess: !!accessToken,
    hasRefresh: !!refreshToken,
  })

  if (!needSignup) {
    await tokenService.setTokens({ accessToken, refreshToken })
    await tokenService.setManualLogout(false)
  }

  return res.data
}

export async function logout() {
  await tokenService.setManualLogout(true)

  try {
    const res = await api.post(AUTH_ENDPOINTS.LOGOUT)
    if (import.meta.env.DEV) {
      console.log('🔒 로그아웃 성공:', res.data.message)
    }
    console.log('[after setTokens]', tokenService.access, tokenService.refresh)
    return res.data
  } catch (error) {
    console.error('🚨 로그아웃 요청 중 오류 발생:', error)
    throw error
  } finally {
    await tokenService.clearTokens()
    await tokenService.clearCurrentUserId()
    currentUserId = null
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const encoded = encodeURIComponent(email)
  const url = USER_ENDPOINTS.CHECK_EMAIL(encoded)
  const res = await api.get(url, { timeout: 15000 })
  const payload = res.data
  const value =
    typeof payload === 'boolean' ? payload : (payload?.data ?? payload)
  return value === true
}

// 사용자 정보 조회
export async function getCurrentUser() {
  try {
    const res = await api.get(AUTH_ENDPOINTS.CURRENT_USER)
    if (import.meta.env.DEV) {
      console.log('현재 사용자 정보:', res.data.data)
    }
    currentUserId = res.data.data.id
    if (currentUserId) {
      await tokenService.setCurrentUserId(currentUserId)
    }
    return res.data
  } catch (e) {
    console.error('현재 사용자 정보 조회 실패:', e)
    currentUserId = null
    throw e
  }
}

// 현재 저장된 사용자 아이디 동기 반환 함수
export function getCurrentUserId() {
  return currentUserId
}

export async function requestEmailVerification(data: VerificationRequest) {
  try {
    const res = await publicApi.post(USER_ENDPOINTS.EMAIL_VERIFICATION, data)
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error('📮 request-verification error', {
        status: e.response?.status,
        url: e.config?.url,
        data: e.response?.data,
      })
    }
    throw e
  }
}

export async function resetPasswordRequest(email: string) {
  const res = await publicApi.post(AUTH_ENDPOINTS.PASSWORD_RESET_REQUEST, {
    email,
  })
  return res.data
}

export async function resetPasswordVerify(data: VerifyCodeRequest) {
  const res = await publicApi.post(AUTH_ENDPOINTS.PASSWORD_RESET_VERIFY, data)
  return res.data
}

export async function resetPassword(data: ResetPasswordRequest) {
  const res = await publicApi.post(AUTH_ENDPOINTS.PASSWORD_RESET_EXECUTE, data)
  return res.data
}

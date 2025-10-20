import type { LoginRequest, LoginResponse } from '../types/auth'
import api from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'

let currentUserId: string | null = null

export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
  const { data: resData } = res.data

  if (resData.accessToken) localStorage.setItem('accessToken', resData.accessToken)
  if (resData.refreshToken) localStorage.setItem('refreshToken', resData.refreshToken)

  if (resData.user?.id) {
    localStorage.setItem('currentUserId', resData.user.id)
  }

  return res.data
}

export async function logout() {
  try {
    const res = await api.post(AUTH_ENDPOINTS.LOGOUT)
    if (import.meta.env.DEV) {
      console.log('🔒 로그아웃 성공:', res.data.message)
    }

    // 로컬 스토리지 토큰 제거 및 currentUserId 초기화
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('currentUserId')
    currentUserId = null

    return res.data
  } catch (error) {
    console.error('🚨 로그아웃 요청 중 오류 발생:', error)
    throw error
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const encoded = encodeURIComponent(email)
  const url = USER_ENDPOINTS.CHECK_EMAIL(encoded)
  const res = await api.get(url, { timeout: 15000 })
  const payload = res.data
  const value = typeof payload === 'boolean' ? payload : (payload?.data ?? payload)
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
      localStorage.setItem('currentUserId', currentUserId)
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

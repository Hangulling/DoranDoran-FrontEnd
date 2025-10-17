import type { LoginRequest, LoginResponse } from '../types/auth'
import { publicApi } from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'

let currentUserId: string | null = null

/** ✅ 로그인 (Auth 서버 8080로 요청) */
export async function login(data: LoginRequest) {
  try {
    const res = await publicApi.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
    const { success, data: resData, message } = res.data

    if (import.meta.env.DEV) {
      console.log('✅ 로그인 성공:', { success, message, user: resData.user })
    }

    // 토큰 저장
    if (resData.accessToken) localStorage.setItem('accessToken', resData.accessToken)
    if (resData.refreshToken) localStorage.setItem('refreshToken', resData.refreshToken)

    return res.data
  } catch (error) {
    console.error('🚨 로그인 요청 중 오류 발생:', error)
    throw error
  }
}

export async function logout() {
  try {
    const res = await publicApi.post(AUTH_ENDPOINTS.LOGOUT)
    if (import.meta.env.DEV) {
      console.log('🔒 로그아웃 성공:', res.data.message)
    }

    // 로컬 스토리지 토큰 제거 및 currentUserId 초기화
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    currentUserId = null

    return res.data
  } catch (error) {
    console.error('🚨 로그아웃 요청 중 오류 발생:', error)
    throw error
  }
}

/** ✅ 이메일 중복 확인 (회원가입 전용, 공개 API로 토큰 없이 요청) */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const res = await publicApi.get(USER_ENDPOINTS.CHECK_EMAIL(email))
    const { success, data, message } = res.data

    if (import.meta.env.DEV) {
      console.log('📧 이메일 중복 확인 결과:', { success, data, message })
    }

    // data === true → 이미 사용 중
    return data === true
  } catch (error) {
    console.error('🚨 이메일 중복 확인 중 오류 발생:', error)
    throw error
  }
}

// 사용자 정보 조회
export async function getCurrentUser() {
  try {
    const res = await publicApi.get(AUTH_ENDPOINTS.CURRENT_USER)
    if (import.meta.env.DEV) {
      console.log('현재 사용자 정보:', res.data.data)
    }
    currentUserId = res.data.data.id
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

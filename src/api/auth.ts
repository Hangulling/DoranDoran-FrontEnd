import type { LoginRequest, LoginResponse } from '../types/auth'
import { authApi, publicApi } from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'

/** ✅ 로그인 (Auth 서버 8082로 요청) */
export async function login(data: LoginRequest) {
  try {
    const res = await authApi.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
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

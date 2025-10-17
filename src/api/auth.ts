import type { LoginRequest, LoginResponse } from '../types/auth'
import api, {  userApi } from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'

// export async function login(data: LoginRequest) {
//   const res = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
//   const d = res.data?.data
//   if (d?.accessToken) localStorage.setItem('accessToken', d.accessToken)
//   if (d?.refreshToken) localStorage.setItem('refreshToken', d.refreshToken)
//   return res.data
// }

export async function login(data: LoginRequest) {
  try {
    const res = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
    const { success, data: resData, message } = res.data

    if (import.meta.env.DEV) {
      console.log('✅ 로그인 성공:', { success, message, user: resData.user })
    }

    if (resData.accessToken) localStorage.setItem('accessToken', resData.accessToken)
    if (resData.refreshToken) localStorage.setItem('refreshToken', resData.refreshToken)

    return res.data
  } catch (error) {
    console.error('🚨 로그인 요청 중 오류 발생:', error)
    throw error
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const encoded = encodeURIComponent(email)
  const url = USER_ENDPOINTS.CHECK_EMAIL(encoded)
  const res = await userApi.get(url, { timeout: 15000 })
  const payload = res.data
  const value = typeof payload === 'boolean' ? payload : (payload?.data ?? payload)
  return value === true
}

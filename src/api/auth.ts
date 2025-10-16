import axios from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  SignupRequest,
  SignupResponse,
} from '../types/auth'
import api from './api'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints'

export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
  // const { accessToken, refreshToken, user } = res.data.data
  const { user } = res.data.data
  // localStorage.setItem('accessToken', accessToken)
  // localStorage.setItem('refreshToken', refreshToken)

  if (import.meta.env.DEV) {
    console.log('✅ 로그인 성공!', { user })
  }
  return res.data
}

export async function signup(data: SignupRequest) {
  const res = await api.post<SignupResponse>(USER_ENDPOINTS.CREATE, data)
  if (import.meta.env.DEV) console.log('🆕 회원가입 응답:', res.data)
  return res.data
}

// export async function getUserByEmailOrNull(email: string) {
//   try {
//     const res = await api.get(USER_ENDPOINTS.GET_BY_EMAIL(email))
//     return res.data?.data ?? null
//   } catch (e: unknown) {
//     if (axios.isAxiosError(e) && e.response?.status === 404) {
//       return null
//     }
//     throw e
//   }
// }

export async function getUserByEmailOrNull(email: string) {
  try {
    const { data } = await api.get(`/api/users/email/${encodeURIComponent(email)}`)
    return data?.data ?? data ?? null
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null
    }
    throw e
  }
}

// 로그아웃
export async function logout(): Promise<LogoutResponse> {
  try {
    const res = await api.post(AUTH_ENDPOINTS.LOGOUT)
    return res.data
  } catch (e) {
    console.error('로그아웃 요청 실패:', e)
    throw e
  }
}

// 사용자 정보 조회
export async function getCurrentUser() {
  try {
    const res = await api.get(AUTH_ENDPOINTS.CURRENT_USER)
    if (import.meta.env.DEV) {
      console.log('현재 사용자 정보:', res.data.data)
    }
    return res.data
  } catch (e) {
    console.error('현재 사용자 정보 조회 실패:', e)
    throw e
  }
}

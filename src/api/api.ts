import axios from 'axios'

/** .env에서 값 미리 불러오기 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8082'

/** 콘솔로 현재 환경 확인 (개발 중 유용) */
console.log('🌐 API Base URL:', API_BASE_URL)
console.log('🔐 AUTH Base URL:', AUTH_BASE_URL)

/** 공개 API (회원가입 / 이메일중복 등, 토큰 미첨부) */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/** 일반 API (로그인 후 사용하는 Gateway, User, Chat 등 / 토큰 자동 첨부) */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/** Auth 전용 API (로그인/리프레시 전용) */
export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/** 요청 인터셉터: 자동 토큰 첨부 (api 전용) */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

/** 응답 인터셉터: 401 시 처리 (api 전용) */
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    if (status === 401) {
      console.warn('🔒 인증 만료 — 로그인 페이지로 이동')
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

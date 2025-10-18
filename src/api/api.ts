import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { AUTH_ENDPOINTS } from './endpoints'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://3.21.177.186:8080').replace(
  /\/+$/,
  ''
)
const AUTH_BASE_URL = (import.meta.env.VITE_AUTH_BASE_URL || '').replace(/\/+$/, '')
const USER_BASE_URL = (import.meta.env.VITE_USER_BASE_URL || '').replace(/\/+$/, '')

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL || API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const userApi = axios.create({
  baseURL: USER_BASE_URL || API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const tokenService = {
  get access() {
    return localStorage.getItem('accessToken') || ''
  },
  set access(v: string) {
    localStorage.setItem('accessToken', v)
  },
  get refresh() {
    return localStorage.getItem('refreshToken') || ''
  },
  set refresh(v: string) {
    localStorage.setItem('refreshToken', v)
  },
  clear() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

// Request Interceptor: attach Authorization
function attachAuth(instance: AxiosInstance) {
  instance.interceptors.request.use(cfg => {
    const token = tokenService.access
    if (token) {
      cfg.headers = cfg.headers ?? {}
      if (!('Authorization' in cfg.headers)) {
        cfg.headers.Authorization = `Bearer ${token}`
      }
      if (import.meta.env.DEV) {
        console.log('🟢 Authorization 적용:', String(token).slice(0, 32) + '...')
      }
    }
    return cfg
  })
}
;[api, userApi].forEach(attachAuth)

// Debug logs (optional) 
authApi.interceptors.request.use(c => {
  if (import.meta.env.DEV)
    console.log('🔐 AUTH →', c.method?.toUpperCase(), authApi.getUri({ ...c, url: c.url || '' }))
  return c
})
publicApi.interceptors.request.use(c => {
  if (import.meta.env.DEV)
    console.log(
      '🌐 PUBLIC →',
      c.method?.toUpperCase(),
      publicApi.getUri({ ...c, url: c.url || '' })
    )
  return c
})
userApi.interceptors.request.use(c => {
  if (import.meta.env.DEV)
    console.log('👤 USER →', c.method?.toUpperCase(), userApi.getUri({ ...c, url: c.url || '' }))
  return c
})

// Refresh Flow (401 전용)
let isRefreshing = false
let requestQueue: Array<(token: string | null) => void> = []

function onRefreshed(newToken: string | null) {
  requestQueue.forEach(cb => cb(newToken))
  requestQueue = []
}
function addToQueue(cb: (token: string | null) => void) {
  requestQueue.push(cb)
}


async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = tokenService.refresh
    if (!refreshToken) throw new Error('No refresh token')

    const res = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken })
    const data = res.data?.data ?? res.data
    const newAccess = data?.accessToken as string | undefined
    const newRefresh = (data?.refreshToken as string | undefined) ?? refreshToken

    if (!newAccess) throw new Error('No new access token')

    tokenService.access = newAccess
    if (newRefresh) tokenService.refresh = newRefresh

    if (import.meta.env.DEV) console.log('♻️ AccessToken 재발급 완료')
    return newAccess
  } catch (e) {
    if (import.meta.env.DEV) console.error('❌ 토큰 재발급 실패:', e)
    tokenService.clear()
    return null
  }
}

// Response Interceptor (401 처리) 
// 보호 API들(api, userApi)에만 장착
function installResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined
      const status = error.response?.status
      const url = (originalRequest?.url || '') + ''

      const isAuthEndpoint =
        url.includes(AUTH_ENDPOINTS.LOGIN) || url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)

      if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise(resolve => {
            addToQueue((newToken: string | null) => {
              if (newToken) {
                originalRequest.headers = originalRequest.headers ?? {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                resolve(instance(originalRequest))
              } else {
                resolve(Promise.reject(error))
              }
            })
          })
        }

        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false
        onRefreshed(newToken)

        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        }

        return Promise.reject(error)
      }

      return Promise.reject(error)
    }
  )
}
;[api, userApi].forEach(installResponseInterceptor)

export default api

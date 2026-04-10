import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { AUTH_ENDPOINTS } from './endpoints'
import { tokenService } from './tokenService'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://api.doran-chat.com'
).replace(/\/+$/, '')

console.log('API_BASE_URL:', API_BASE_URL)
console.log('RAW_ENV_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

function redirectToLogin() {
  if (typeof window === 'undefined') return

  const current = `${window.location.pathname}${window.location.hash}`
  if (current.includes('/login')) return

  const isHashRouter = window.location.hash.startsWith('#/')

  if (isHashRouter) {
    window.location.hash = '#/login'
    return
  }

  window.location.assign('/login')
}

function emitAuthEvent(
  type: 'auth:expired' | 'auth:logout' | 'auth:inactive',
  detail?: unknown
) {
  const manualLogout = tokenService.manualLogout

  if (manualLogout && (type === 'auth:expired' || type === 'auth:inactive')) {
    return
  }
  window.dispatchEvent(new CustomEvent(type, { detail }))
}

function dropHeader(headers: unknown, name: string) {
  if (!headers) return
  const h = headers as Record<string, unknown>
  for (const k of Object.keys(h)) {
    if (k.toLowerCase() === name.toLowerCase()) delete h[k]
  }
}

function attachAuth(instance: AxiosInstance) {
  instance.interceptors.request.use(cfg => {
    const token = tokenService.access
    cfg.headers = cfg.headers ?? {}

    if (token && !('Authorization' in cfg.headers)) {
      cfg.headers.Authorization = `Bearer ${token}`
    }

    const url = cfg.url || ''
    if (url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)) {
      dropHeader(cfg.headers, 'authorization')
    }

    if (import.meta.env.DEV) {
      console.log('🟢 Authorization 적용:', String(token).slice(0, 32) + '...')
    }
    return cfg
  })
}

publicApi.interceptors.request.use(cfg => {
  if (cfg.headers && 'Authorization' in cfg.headers) {
    delete cfg.headers.Authorization
  }
  if (import.meta.env.DEV) {
    console.log('publicApi request', {
      url: (cfg.baseURL || '') + (cfg.url || ''),
      headers: cfg.headers,
      data: cfg.data,
    })
  }
  return cfg
})

attachAuth(api)

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
    const newRefresh =
      (data?.refreshToken as string | undefined) ?? refreshToken

    if (!newAccess) throw new Error('No new access token')

    await tokenService.setTokens({
      accessToken: newAccess,
      refreshToken: newRefresh,
    })

    if (import.meta.env.DEV) console.log('♻️ AccessToken 재발급 완료')
    return newAccess
  } catch (e) {
    if (import.meta.env.DEV) console.error('❌ 토큰 재발급 실패:', e)
    await tokenService.clearTokens()
    emitAuthEvent('auth:expired', { reason: 'refresh_failed' })
    redirectToLogin()
    return null
  }
}

function installResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
      if (!error.response) {
        if (tokenService.access) {
          emitAuthEvent('auth:inactive', { reason: 'network_or_cors' })
        }
        return Promise.reject(error)
      }

      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined
      const status = error.response?.status
      const url = (originalRequest?.url || '') + ''

      const isAuthEndpoint =
        url.includes(AUTH_ENDPOINTS.LOGIN) ||
        url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN) ||
        url.includes(AUTH_ENDPOINTS.LOGOUT)

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise(resolve => {
            addToQueue((newToken: string | null) => {
              if (newToken) {
                originalRequest.headers = originalRequest.headers ?? {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                resolve(instance(originalRequest))
              } else {
                emitAuthEvent('auth:expired', {
                  reason: 'refresh_failed_queue',
                })
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

        emitAuthEvent('auth:expired', { reason: 'refresh_failed_401' })
        redirectToLogin()
        return Promise.reject(error)
      }

      if (status === 401 && originalRequest?._retry && !isAuthEndpoint) {
        await tokenService.clearTokens()
        emitAuthEvent('auth:expired', { reason: 'final_401_after_retry', url })
        redirectToLogin()
        return Promise.reject(error)
      }

      if (status === 401 && !tokenService.refresh && !isAuthEndpoint) {
        await tokenService.clearTokens()
        emitAuthEvent('auth:expired', { reason: 'no_refresh_token', url })
        redirectToLogin()
        return Promise.reject(error)
      }

      return Promise.reject(error)
    }
  )
}

installResponseInterceptor(api)

export default api

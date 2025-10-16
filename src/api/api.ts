import axios from 'axios'

const getBaseURL = (port?: number): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://3.21.177.186'
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.error('❌ VITE_API_BASE_URL이 설정되지 않았습니다! 기본값을 사용합니다.')
  }
  return port ? `${apiBaseUrl}:${port}` : apiBaseUrl
}

// 인증 서비스 (포트 8081)
export const authApi = axios.create({
  baseURL: getBaseURL(8081),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 사용자 서비스 (포트 8082)
export const userApi = axios.create({
  baseURL: getBaseURL(8082),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 채팅 서비스 (포트 8083)
export const chatApi = axios.create({
  baseURL: getBaseURL(8083),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

userApi.interceptors.request.use(
  config => {
    // const token = localStorage.getItem('accessToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    console.error('🚨 요청 설정 중 에러:', error)
    return Promise.reject(error)
  }
)

userApi.interceptors.response.use(
  response => response,
  error => {
    // const status = error.response?.status
    // if (status === 401) {
    //   console.warn('인증 만료')
    //   localStorage.removeItem('accessToken')
    //   window.location.href = '/login'
    // }
    return Promise.reject(error)
  }
)

export default {
  userApi,
  authApi,
  chatApi,
}

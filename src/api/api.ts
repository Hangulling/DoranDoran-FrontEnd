import axios from 'axios'

const getBaseURL = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    console.error('❌ VITE_API_BASE_URL이 설정되지 않았습니다!')
    return 'http://localhost:8080' // 배포 시 변경해야함
  }

  console.log('🌐 API Base URL:', apiBaseUrl)
  return apiBaseUrl
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
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

api.interceptors.response.use(
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

export default api

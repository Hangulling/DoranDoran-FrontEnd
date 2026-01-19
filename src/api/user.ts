import type {
  User,
  CreatePayload,
  UpdatePayload,
  UserStatus,
  EmailPayload,
} from '../types/user'
import api, { publicApi } from './api'
import { USER_ENDPOINTS } from './endpoints'

export const createUser = async (payload: CreatePayload): Promise<User> => {
  if (import.meta.env.DEV) console.log('📨 createUser payload:', payload)

  const res = await api.post(USER_ENDPOINTS.CREATE, payload)
  const body = res.data
  if (import.meta.env.DEV) console.log('📩 createUser response:', body)

  if (body?.success === false) {
    throw new Error(body?.message || 'Sign up failed')
  }
  return (body?.data ?? body) as User
}

// ID로 정보 조회
export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get<User>(USER_ENDPOINTS.GET_BY_ID(userId))
  return response.data
}

// 이메일로 정보 조회
export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await api.get<User>(USER_ENDPOINTS.GET_BY_EMAIL(email))
  return response.data
}

// 정보 업데이트
export const updateUser = async (
  userId: string,
  payload: UpdatePayload
): Promise<User> => {
  const response = await api.put<User>(USER_ENDPOINTS.UPDATE(userId), payload)
  return response.data
}

// 상태 변경
export const updateStatus = async (
  userId: string,
  status: UserStatus
): Promise<void> => {
  await api.patch(USER_ENDPOINTS.UPDATE_STATUS(userId), null, {
    params: { status },
  })
}

// 온보딩 상태 업데이트
export const updateOnboarding = async (
  userId: string,
  isOnboard: boolean
): Promise<void> => {
  await api.patch(USER_ENDPOINTS.UPDATE_ONBOARDING(userId), {
    isOnboard,
  })
}

// 문의용 이메일 조회
export const getUserEmailForSupport = async (
  userId: string
): Promise<string> => {
  const response = await api.get(USER_ENDPOINTS.GET_EMAIL(userId))
  return response.data.data
}

// 관심 주제 조회
export const getUserInterests = async (userId: string) => {
  const response = await api.get(USER_ENDPOINTS.GET_INTERESTS(userId))
  return response.data
}

// 관심 주제 저장
export const updateInterests = async (userId: string, topicKeys: string[]) => {
  const response = await api.put(USER_ENDPOINTS.UPDATE_INTERESTS(userId), {
    topicKeys,
  })
  return response.data
}

// 알림 설정 조회
export const getNotificationSetting = async (userId: string) => {
  const response = await api.get(USER_ENDPOINTS.GET_NOTIFICATIONS(userId))
  return response.data
}

// 알림 설정 변경
export const updateNotificationSetting = async (
  userId: string,
  pushEnabled: boolean
) => {
  const response = await api.put(USER_ENDPOINTS.UPDATE_NOTIFICATIONS(userId), {
    pushEnabled,
  })
  return response.data
}

// 통계 조회
export const getUserStats = async (userId: string) => {
  const response = await api.get(USER_ENDPOINTS.GET_STATS(userId))
  return response.data
}

// 퍼펙트 증가
export const increasePerfectCount = async (userId: string) => {
  const response = await api.post(USER_ENDPOINTS.INCREASE_PERFECT(userId))
  return response.data
}

// 비밀번호 재설정
export const passwordReset = async (email: string): Promise<void> => {
  await api.post(USER_ENDPOINTS.PASSWORD_RESET, { email })
}

// 계정 비활성화 (소프트 삭제)
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(USER_ENDPOINTS.DELETE(userId))
}

// 상태
export const checkHealth = async (): Promise<string> => {
  const response = await api.get<string>(USER_ENDPOINTS.HEALTH)
  return response.data
}

export const findEmail = async (data: EmailPayload) => {
  const res = await publicApi.post(USER_ENDPOINTS.FIND_EMAIL, data)
  return res.data
}

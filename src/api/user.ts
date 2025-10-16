import type { User, CreatePayload, UpdatePayload, UserStatus } from '../types/user'
import { userApi } from './api'
import { USER_ENDPOINTS } from './endpoints'

// 생성
export const createUser = async (payload: CreatePayload): Promise<User> => {
  const response = await userApi.post<User>(USER_ENDPOINTS.CREATE, payload)
  return response.data
}

// ID로 정보 조회
export const getUserById = async (userId: string): Promise<User> => {
  const response = await userApi.get<User>(USER_ENDPOINTS.GET_BY_ID(userId))
  return response.data
}

// 이메일로 정보 조회
export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await userApi.get<User>(USER_ENDPOINTS.GET_BY_EMAIL(email))
  return response.data
}

// 정보 업데이트
export const updateUser = async (userId: string, payload: UpdatePayload): Promise<User> => {
  const response = await userApi.put<User>(USER_ENDPOINTS.UPDATE(userId), payload)
  return response.data
}

// 상태 변경
export const updateStatus = async (userId: string, status: UserStatus): Promise<void> => {
  await userApi.patch(USER_ENDPOINTS.UPDATE_STATUS(userId), null, {
    params: { status },
  })
}

// 비밀번호 재설정
export const passwordReset = async (email: string): Promise<void> => {
  await userApi.post(USER_ENDPOINTS.PASSWORD_RESET, { email })
}

// 계정 비활성화 (소프트 삭제)
export const deleteUser = async (userId: string): Promise<void> => {
  await userApi.delete(USER_ENDPOINTS.DELETE(userId))
}

// 상태
export const checkHealth = async (): Promise<string> => {
  const response = await userApi.get<string>(USER_ENDPOINTS.HEALTH)
  return response.data
}

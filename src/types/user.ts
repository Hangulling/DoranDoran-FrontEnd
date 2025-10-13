// 사용자 상태
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

// 사용자 역할
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN'

//사용자 정보 응답
export interface User {
  id: string // UUID
  email: string
  firstName: string
  lastName: string
  name: string
  status: UserStatus
  role: UserRole
  createdAt: string // ISO 8601 날짜 문자열
  updatedAt: string
}

// 사용자 생성 시 요청
export interface CreatePayload {
  email: string
  firstName: string
  lastName: string
  name: string
  password: string
  picture?: string
  info?: string
}

// 사용자 정보 업데이트 요청
export interface UpdatePayload {
  firstName: string
  lastName: string
  name: string
  picture?: string
  info?: string
}

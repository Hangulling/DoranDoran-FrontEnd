import type { BotType } from '../types/archive'

// Users endpoints
export const USER_ENDPOINTS = {
  CREATE: '/api/users',
  RESIGTER: '/api/users/register',

  // 이메일 찾기
  FIND_EMAIL: '/api/users/find-email',

  // 사용자 조회
  GET_BY_ID: (userId: string) => `/api/users/${userId}`,
  GET_BY_EMAIL: (email: string) => `/api/users/email/${email}`,

  // 문의용 사용자 이메일 조회
  GET_EMAIL: (userId: string) => `/api/users/${userId}/email`,

  // 이메일 중복 확인
  CHECK_EMAIL: (email: string) => `/api/users/check-email/${email}`,

  // 이메일 인증
  EMAIL_VERIFICATION: '/api/auth/email/request-verification',

  // 사용자 정보 업데이트
  UPDATE: (userId: string) => `/api/users/${userId}`,

  // 사용자 상태 업데이트
  UPDATE_STATUS: (userId: string) => `/api/users/${userId}/status`,

  // 온보딩 제출 (변경)
  UPDATE_ONBOARDING: (userId: string) => `/api/users/${userId}/onboard`,

  // 관심 주제 조회
  GET_INTERESTS: (userId: string) => `/api/users/${userId}/interests`,

  // 관심 주제 수정
  UPDATE_INTERESTS: (userId: string) => `/api/users/${userId}/interests`,

  // 알림 설정 조회
  GET_NOTIFICATIONS: (userId: string) => `/api/users/${userId}/notifications`,

  // 알림 설정 변경
  UPDATE_NOTIFICATIONS: (userId: string) =>
    `/api/users/${userId}/notifications`,

  // 대시보드 상태 조회
  GET_STATS: (userId: string) => `/api/users/${userId}/stats`,

  // 퍼펙트 증가
  INCREASE_PERFECT: (userId: string) => `/api/users/${userId}/stats/perfect`,

  // 비밀번호 재설정
  PASSWORD_RESET: '/api/users/password/reset',

  // 회원탈퇴
  DELETE: (userId: string) => `/api/users/${userId}/hard`,

  // 헬스체크
  HEALTH: '/api/users/health',
}

// Auth endpoints
export const AUTH_ENDPOINTS = {
  // 로그인
  LOGIN: '/api/auth/login',

  // 소셜 로그인
  OAUTH_LOGIN: '/api/auth/oauth/login',

  // 로그아웃
  LOGOUT: '/api/auth/logout',

  // 토큰 검증
  VALIDATE_TOKEN: '/api/auth/validate',

  // 토큰 갱신
  REFRESH_TOKEN: '/api/auth/refresh',

  // 비밀번호 재설정 코드 요청
  PASSWORD_RESET_REQUEST: '/api/auth/password/reset/request-code',

  // 비밀번호 재설정 코드 검증
  PASSWORD_RESET_VERIFY: '/api/auth/password/reset/verify-code',

  // 비밀번호 재설정 실행
  PASSWORD_RESET_EXECUTE: '/api/auth/password/reset/execute',

  // 현재 사용자 정보 조회
  CURRENT_USER: '/api/auth/me',

  // 헬스체크
  HEALTH: '/api/auth/health',
}

// Chat endpoints
export const CHAT_ENDPOINTS = {
  // 채팅방 생성/조회
  CREATE: '/api/chat/chatrooms',

  // 채팅방 목록 조회
  CHATROOM_LIST: (userId?: string, page: number = 0, size: number = 20) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    params.append('page', page.toString())
    params.append('size', size.toString())
    return `/api/chat/chatrooms?${params.toString()}`
  },

  // 채팅방 단건 조회
  GET_CHATROOM: (chatroomId: string) => `/api/chat/chatrooms/${chatroomId}`,

  // 채팅방 목록 (최대 4개) 조회
  CHATROOM_LIST_LIMITED: '/api/chat/chatrooms/all',

  // 메시지 목록 조회
  MESSAGES_LIST: (
    chatroomId: string,
    userId?: string,
    page: number = 0,
    size: number = 50
  ) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    params.append('page', page.toString())
    params.append('size', size.toString())
    return `/api/chat/chatrooms/${chatroomId}/messages?${params.toString()}`
  },

  // 메시지 전송
  SEND_MESSAGE: (chatroomId: string) =>
    `/api/chat/chatrooms/${chatroomId}/messages`,

  // 메시지 전송 취소
  CANCEL_MESSAGE: (messageId: string) =>
    `/api/chat/messages/${messageId}/cancel`,

  // 메시지 단건 조회
  GET_MESSAGE: (messageId: string) => `/api/chat/messages/${messageId}`,

  // 친밀도 업데이트
  UPDATE_INTIMACY_LEVEL: (chatroomId: string) =>
    `/api/chat/chatrooms/${chatroomId}/intimacy`,

  // 채팅방 나가기 (소프트 삭제)
  LEAVE_CHATROOM: (chatroomId: string, userId: string) =>
    `/api/chat/chatrooms/${chatroomId}/leave?userId=${userId}`,

  // SSE
  MESSAGE_STREAM: (chatroomId: string, userId?: string) =>
    `/api/chat/stream/${chatroomId}${userId ? `?userId=${userId}` : ''}`,

  // 마지막 채팅 시간
  LAST_INTERACTIONS: (userId: string) =>
    `/api/chat/chatrooms/last-interactions?userId=${userId}&limit=4`,

  // 테스트
  LAST_INTERACTIONS_TEST: (userId: string, testModel: 'a' | 'b' | 'c') =>
    `/api/chat/chatrooms/last-interactions?userId=${userId}&limit=4&testModel=${testModel}`,

  // 딥링크로 채팅방 생성
  DEEPLINK_CHATROOM: () => `/api/deeplink/chatroom/create`,

  // 딥링크 그리팅 메시지
  START_GREETING: (chatroomId: string) =>
    `/api/chat/chatrooms/${chatroomId}/start-greeting`,
}

// Bookmark Endpoints
export const BOOKMARK_ENDPOINTS = {
  //  북마크 저장 (POST)
  CREATE: '/api/store/bookmarks',

  //  전체 조회 (GET)
  LIST_ALL: '/api/store/bookmarks',

  // 커서 기반 조회 (무한 스크롤)
  LIST_CURSOR: (lastId?: string, size: number = 15) => {
    const params = new URLSearchParams()
    if (lastId) params.append('lastId', lastId)
    params.append('size', size.toString())
    return `/api/store/bookmarks/cursor?${params.toString()}`
  },

  // 봇타입 별 커서기반 조회
  LIST_CURSOR_BY_BOTTYPE: (
    botType: BotType,
    lastId?: string,
    size: number = 15
  ) => {
    const params = new URLSearchParams()
    if (lastId) params.append('lastId', lastId)
    if (size) params.append('size', String(size))
    const q = params.toString()
    return `/api/store/bookmarks/bot-type/${botType}/cursor${q ? `?${q}` : ''}`
  },

  // 방별 커서기반 조회
  LIST_CURSOR_BY_CHATROOM: (
    chatroomId: string,
    lastId?: string,
    size: number = 15
  ) => {
    const params = new URLSearchParams()
    if (lastId) params.append('lastId', lastId)
    params.append('size', String(size))
    const q = params.toString()
    return `/api/store/bookmarks/chatroom/${chatroomId}/cursor${q ? `?${q}` : ''}`
  },

  // 페이지 기반 조회 (Offset Pagination)
  LIST_PAGE: (page: number = 0, size: number = 20, sort = 'createdAt,desc') =>
    `/api/store/bookmarks/page?page=${page}&size=${size}&sort=${sort}`,

  // 챗봇 타입별 북마크 조회
  LIST_BY_BOT_TYPE: (botType: BotType) =>
    `/api/store/bookmarks/bot-type/${botType}`,

  // 북마크 개수 조회
  COUNT: '/api/store/bookmarks/count',

  // 단일 북마크 삭제
  DELETE_ONE: (bookmarkId: string) => `/api/store/bookmarks/${bookmarkId}`,

  // 여러 북마크 일괄 삭제
  DELETE_MANY: '/api/store/bookmarks',

  // 방별 보관함 조회 (새로고침 시 사용)
  LIST_BY_CHATROOMID: (chatroomId: string) =>
    `/api/store/bookmarks/chatroom/${chatroomId}`,
}

// Home endpoints
export const HOME_ENDPOINTS = {
  // 게시글 목록 조회
  GET_POSTS: '/api/home/v2/posts',
  // 게시글 상세 조회
  GET_POST_DETAIL: (externalId: string) => `/api/home/v2/posts/${externalId}`,
}

// Support endpoints
export const SUPPORT_ENDPOINTS = {
  // 문의/신고 생성
  CREATE: '/api/support',
}

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  // FCM 토큰 등록
  REGISTER: '/api/notifications/register',
  // 푸시 발송 (내부 테스트용 등)
  SEND: '/api/notifications/send',
  // 푸시 로그 조회
  LOGS: (userId: string) => `/api/notifications/logs?userId=${userId}`,
  // 푸시 테스트
  TEST_PUSH: '/api/notifications/test',
  // 채팅방 딥링크 푸시 테스트
  TEST_CHATROOM_PUSH: '/api/notifications/test-chatroom-push',
}

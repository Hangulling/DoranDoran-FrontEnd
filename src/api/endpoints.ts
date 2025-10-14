// Users endpoints
export const USER_ENDPOINTS = {
  CREATE: '/api/users',

  // 사용자 조회
  GET_BY_ID: (userId: string) => `/api/users/${userId}`,
  GET_BY_EMAIL: (email: string) => `/api/users/email/${email}`,

  // 사용자 정보 업데이트
  UPDATE: (userId: string) => `/api/users/${userId}`,

  // 사용자 상태 업데이트
  UPDATE_STATUS: (userId: string) => `/api/users/${userId}/status`,

  // 비밀번호 재설정
  PASSWORD_RESET: '/api/users/password/reset',

  // 회원탈퇴(소프트 삭제)
  DELETE: (userId: string) => `/api/users/${userId}`,

  // 헬스체크
  HEALTH: '/api/users/health',
}

// Auth endpoints
export const AUTH_ENDPOINTS = {
  // 로그인
  LOGIN: '/api/auth/login',

  // 로그아웃
  LOGOUT: '/api/auth/logout',

  // 토큰 검증
  VALIDATE_TOKEN: '/api/auth/validate',

  // 토큰 갱신
  REFRESH_TOKEN: '/api/auth/refresh',

  // 비밀번호 재설정 요청
  PASSWORD_RESET_REQUEST: '/api/auth/password/reset/request',

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

  // 메시지 목록 조회
  MESSAGES_LIST: (chatroomId: string, userId?: string, page: number = 0, size: number = 50) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    params.append('page', page.toString())
    params.append('size', size.toString())
    return `/api/chat/chatrooms/${chatroomId}/messages?${params.toString()}`
  },

  // 메시지 전송
  SEND_MESSAGE: (chatroomId: string) => `/api/chat/chatrooms/${chatroomId}/messages`,

  // 친밀도 업데이트
  UPDATE_INTIMACY_LEVEL: (chatroomId: string) => `/api/chat/chatrooms/${chatroomId}/intimacy`,

  // 채팅방 나가기 (소프트 삭제)
  LEAVE_CHATROOM: (chatroomId: string) => `/api/chat/chatrooms/${chatroomId}/leave`,

  // WebSocket 채팅 연결
  WEBSOCKET_CHAT: (chatroomId: string, userId?: string) =>
    `/ws/chat/${chatroomId}${userId ? `?userId=${userId}` : ''}`,

  // SSE
  MESSAGE_STREAM: (chatroomId: string, userId?: string) =>
    `/api/chat/stream/${chatroomId}${userId ? `?userId=${userId}` : ''}`,

  // 챗봇 프롬프트 수정
  UPDATE_CHATBOT_PROMPT: '/api/chat/chatbots/prompt',

  // 챗봇 프롬프트 리셋
  RESET_CHATBOT_PROMPT: (chatbotId: string, agentType: string) =>
    `/api/chat/chatbots/reset?chatbotId=${chatbotId}&agentType=${agentType}`,

  // 챗봇 조회
  GET_CHATBOT: (chatbotId: string) => `/api/chat/chatbots/${chatbotId}`,

  // Agent 프롬프트 조회
  GET_AGENT_PROMPT: (chatbotId: string, agentType: string) =>
    `/api/chat/chatbots/${chatbotId}/agents/${agentType}`,
}

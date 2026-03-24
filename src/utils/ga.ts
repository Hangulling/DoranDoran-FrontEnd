import ReactGA from 'react-ga4'
import {
  GA_ENABLED,
  GA_ID,
  GA_INTERNAL_EMAILS,
  IS_PROD,
} from '../constants/env'

// 내부 유저 판별
const INTERNAL_EMAIL_LIST = GA_INTERNAL_EMAILS
  ? GA_INTERNAL_EMAILS.split(',').map((email: string) => email.trim())
  : []

let isInternalUser = false
let currentUserId: string | null = null // 현재 사용자 Id 저장

// 유닉스 타임스탬프 반환
export const getUnixTime = () => Math.floor(Date.now() / 1000)

// 날짜 문자열 반환
export const getTodayDate = () => new Date().toISOString().split('T')[0]

export const setGAUserContext = (userId?: string, email?: string) => {
  if (email && INTERNAL_EMAIL_LIST.includes(email)) {
    isInternalUser = true
  } else {
    isInternalUser = false
  }

  currentUserId = userId || null

  if (IS_PROD && GA_ENABLED && userId && !isInternalUser) {
    ReactGA.set({ user_id: userId }) // GA4 시스템 식별용 전역 설정
  }
}

// GA 초기화 함수
export const initGA = () => {
  if (IS_PROD && GA_ENABLED && GA_ID) {
    ReactGA.initialize(GA_ID)
  }
}

/**
 * GA 커스텀 이벤트를 전송하는 헬퍼 함수
 * @param eventName - 이벤트 이름
 * @param params - 이벤트와 함께 보낼 추가 정보
 */

export const sendGAEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean | undefined | null>
) => {
  if (IS_PROD && GA_ENABLED && !isInternalUser) {
    const eventParams = {
      user_id: currentUserId,
      ...params,
    }

    ReactGA.event(eventName, eventParams)
  }
}

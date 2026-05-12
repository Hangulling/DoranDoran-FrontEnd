import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics'
import { GA_ENABLED, GA_INTERNAL_EMAILS, IS_PROD } from '../constants/env'

// 내부 유저 판별
const INTERNAL_EMAIL_LIST = GA_INTERNAL_EMAILS
  ? GA_INTERNAL_EMAILS.split(',').map((email: string) => email.trim())
  : []

let isInternalUser = false
let currentUserId: string | null = null

// 유닉스 타임스탬프 반환
export const getUnixTime = () => Math.floor(Date.now() / 1000)

// 날짜 문자열 반환
export const getTodayDate = () => new Date().toISOString().split('T')[0]

/**
 * 사용자 컨텍스트 설정 (UserId 및 내부 유저 여부)
 */
export const setGAUserContext = async (userId?: string, email?: string) => {
  if (email && INTERNAL_EMAIL_LIST.includes(email)) {
    isInternalUser = true
  } else {
    isInternalUser = false
  }

  currentUserId = userId || null

  if (IS_PROD && GA_ENABLED && userId && !isInternalUser) {
    await FirebaseAnalytics.setUserId({ userId })
  }
}

/**
 * GA(Firebase) 초기화 함수
 */
export const initGA = async () => {
  if (IS_PROD && GA_ENABLED) {
    await FirebaseAnalytics.setCollectionEnabled({ enabled: true })
  }
}

/**
 * 이벤트를 전송하는 헬퍼 함수
 * @param eventName - 이벤트 이름
 * @param params - 이벤트와 함께 보낼 추가 정보
 */
export const sendGAEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | undefined | null>
) => {
  if (IS_PROD && GA_ENABLED && !isInternalUser) {
    const filteredParams: Record<string, string | number | boolean> = {}

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          filteredParams[key] = value
        }
      })
    }

    await FirebaseAnalytics.logEvent({
      name: eventName,
      params: {
        user_id: currentUserId || '',
        ...filteredParams,
      },
    })
  }
}

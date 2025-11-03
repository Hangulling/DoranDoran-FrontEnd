import { msUntilExpiry } from './authToken'

let expirationTimer: NodeJS.Timeout | null = null

export function clearExpirationTimer() {
  if (expirationTimer) {
    clearTimeout(expirationTimer)
    expirationTimer = null
  }
}

export function scheduleExpiration(accessToken: string) {
  // 기존 타이머가 있다면 제거
  clearExpirationTimer()

  // 남은 시간 계산
  const totalRemainingMs = msUntilExpiry(accessToken)

  if (totalRemainingMs === null) {
    console.error('[Auth] 토큰을 디코딩할 수 없거나 exp 값이 없습니다.')
    return
  }

  // 1분 전 계산
  const ONE_MINUTE_MS = 60 * 1000

  // 총 남은 시간 - 1분
  const triggerTimeMs = Math.max(totalRemainingMs - ONE_MINUTE_MS, 0)

  // 1분 전 시점에 auth:expired 이벤트를 발생시키는 새 타이머를 설정
  expirationTimer = setTimeout(() => {
    console.warn('[Auth] 토큰 만료 1분 전. 자동 로그아웃을 준비.')
    window.dispatchEvent(new CustomEvent('auth:expired', { detail: { reason: 'pre_expiry' } }))
  }, triggerTimeMs) // 1분이 빠진 시간으로 타이머 설정
}

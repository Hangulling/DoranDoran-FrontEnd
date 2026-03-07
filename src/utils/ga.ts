import ReactGA from 'react-ga4'

const GA_ID = import.meta.env.VITE_GA_ID
const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'

// GA 초기화 함수
export const initGA = () => {
  if (import.meta.env.PROD && GA_ENABLED && GA_ID) {
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
  if (import.meta.env.PROD && GA_ENABLED) {
    ReactGA.event(eventName, params)
  }
}

// src/components/AnalyticsTracker.tsx (새 파일 생성)
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const AnalyticsTracker = () => {
  const location = useLocation()

  useEffect(() => {
    // location.pathname과 location.search가 변경될 때마다 실행
    const pagePath = location.pathname + location.search

    ReactGA.send({
      hitType: 'pageview',
      page: pagePath, // 현재 경로 (e.g., /chat/1)
    })

    // 개발 환경일 때만 콘솔에 로그
    if (import.meta.env.DEV) {
      console.log(`[GA Pageview Sent]: ${pagePath}`)
    }
  }, [location]) // location 객체가 변경될 때마다 effect 실행

  return null // 이 컴포넌트는 화면에 아무것도 그리지 않음
}

export default AnalyticsTracker

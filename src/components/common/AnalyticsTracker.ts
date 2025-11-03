import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'

const AnalyticsTracker = () => {
  const location = useLocation()

  useEffect(() => {
    if (import.meta.env.PROD && GA_ENABLED) {
      const pagePath = location.pathname + location.search
      ReactGA.send({
        hitType: 'pageview',
        page: pagePath,
      })
    }
  }, [location])

  return null
}

export default AnalyticsTracker

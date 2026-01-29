export const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'
export const IS_PROD = import.meta.env.PROD

export const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || ''

export const GOOGLE_IOS_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || ''

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

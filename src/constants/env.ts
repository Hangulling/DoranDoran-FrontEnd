export const GA_ID = import.meta.env.VITE_GA_ID || ''
export const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'
export const IS_PROD = import.meta.env.PROD
export const GA_INTERNAL_EMAILS = import.meta.env.VITE_GA_INTERNAL_EMAILS || ''

export const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || ''

export const GOOGLE_IOS_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || ''

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || ''

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

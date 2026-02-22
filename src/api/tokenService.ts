import { Preferences } from '@capacitor/preferences'

const KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
  manualLogout: 'session:manualLogout',
  currentUserId: 'currentUserId',
  lastLogin: 'lastLogin',
} as const

type Tokens = { accessToken: string; refreshToken: string }

type Provider = 'google' | 'apple' | 'email'

let accessTokenCache = ''
let refreshTokenCache = ''
let manualLogoutCache = false

let lastLoginCache: Provider | '' = ''

export const tokenService = {
  async hydrate() {
    const [a, r, m, l] = await Promise.all([
      Preferences.get({ key: KEYS.access }),
      Preferences.get({ key: KEYS.refresh }),
      Preferences.get({ key: KEYS.manualLogout }),
      Preferences.get({ key: KEYS.lastLogin }),
    ])

    accessTokenCache = a.value ?? ''
    refreshTokenCache = r.value ?? ''
    manualLogoutCache = (m.value ?? '0') === '1'
    const v = l.value ?? ''
    lastLoginCache = v === 'google' || v === 'email' || v === 'apple' ? v : ''
  },

  get access() {
    return accessTokenCache
  },
  get refresh() {
    return refreshTokenCache
  },

  get manualLogout() {
    return manualLogoutCache
  },

  get lastLogin() {
    return lastLoginCache || null
  },

  async setTokens(tokens: Partial<Tokens>) {
    if (typeof tokens.accessToken === 'string') {
      accessTokenCache = tokens.accessToken
      await Preferences.set({ key: KEYS.access, value: tokens.accessToken })
    }
    if (typeof tokens.refreshToken === 'string') {
      refreshTokenCache = tokens.refreshToken
      await Preferences.set({ key: KEYS.refresh, value: tokens.refreshToken })
    }
  },

  async clearTokens() {
    accessTokenCache = ''
    refreshTokenCache = ''
    await Promise.all([
      Preferences.remove({ key: KEYS.access }),
      Preferences.remove({ key: KEYS.refresh }),
    ])
  },

  async setLastLogin(provider: Provider) {
    lastLoginCache = provider
    await Preferences.set({ key: KEYS.lastLogin, value: provider })
  },

  async clearLastLogin() {
    lastLoginCache = ''
    await Preferences.remove({ key: KEYS.lastLogin })
  },

  async setManualLogout(flag: boolean) {
    manualLogoutCache = flag
    await Preferences.set({ key: KEYS.manualLogout, value: flag ? '1' : '0' })
  },

  async setCurrentUserId(id: string) {
    await Preferences.set({ key: KEYS.currentUserId, value: id })
  },

  async clearCurrentUserId() {
    await Preferences.remove({ key: KEYS.currentUserId })
  },
}

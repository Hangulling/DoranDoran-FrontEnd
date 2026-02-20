import { Preferences } from '@capacitor/preferences'

const KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
  manualLogout: 'session:manualLogout',
  currentUserId: 'currentUserId',
} as const

type Tokens = { accessToken: string; refreshToken: string }

let accessTokenCache = ''
let refreshTokenCache = ''
let manualLogoutCache = false

export const tokenService = {
  async hydrate() {
    const [a, r, m] = await Promise.all([
      Preferences.get({ key: KEYS.access }),
      Preferences.get({ key: KEYS.refresh }),
      Preferences.get({ key: KEYS.manualLogout }),
    ])

    accessTokenCache = a.value ?? ''
    refreshTokenCache = r.value ?? ''
    manualLogoutCache = (m.value ?? '0') === '1'
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

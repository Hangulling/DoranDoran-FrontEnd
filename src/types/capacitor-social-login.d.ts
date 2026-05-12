declare module '@capgo/capacitor-social-login' {
  export interface GoogleLoginResult {
    idToken?: string
    accessToken?: string
    serverAuthCode?: string
    email?: string
    name?: string
  }

  export interface AppleLoginResult {
    idToken?: string
    accessToken?: string
    email?: string
    name?: string
  }

  export interface FacebookLoginResult {
    accessToken?: string
    userId?: string
    email?: string
    name?: string
  }

  export interface SocialLoginResponse {
    provider: string
    result: GoogleLoginResult | AppleLoginResult | FacebookLoginResult
  }

  export const SocialLogin: {
    initialize(options: {
      google?: {
        webClientId?: string
        iOSClientId?: string
        iOSServerClientId?: string
      }
      apple?: {
        clientId?: string
        redirectUrl?: string
      }
      facebook?: {
        appId?: string
        clientToken?: string
      }
    }): Promise<void>

    login(options: {
      provider: 'google' | 'apple' | 'facebook'
      options?: {
        scopes?: string[]
      }
    }): Promise<SocialLoginResponse>
  }
}

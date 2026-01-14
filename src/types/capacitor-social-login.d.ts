declare module '@capgo/capacitor-social-login' {
  export interface GoogleLoginResult {
    idToken?: string
    accessToken?: string
    serverAuthCode?: string
    email?: string
    name?: string
  }

  export interface SocialLoginResponse {
    provider: string
    result: GoogleLoginResult
  }

  export const SocialLogin: {
    initialize(options: {
      google?: {
        webClientId?: string
        iOSClientId?: string
        iOSServerClientId?: string
      }
    }): Promise<void>

    login(options: {
      provider: 'google'
      options?: {
        scopes?: string[]
      }
    }): Promise<SocialLoginResponse>
  }
}

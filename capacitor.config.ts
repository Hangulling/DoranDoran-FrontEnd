import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.koach.app',
  appName: 'K-oach',
  webDir: 'dist',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: false,
    },
  },
}

export default config

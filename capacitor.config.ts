import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.koach.app',
  appName: 'K-oach',
  webDir: 'dist',
  server: {
    url: 'http://localhost:3000', // adb reverse tcp:3000 tcp:3000
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
  },
}

export default config

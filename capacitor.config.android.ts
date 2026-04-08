import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.koach.app',
  appName: 'K-oach',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: true,
        twitter: false,
      },
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: false,
    },
    SplashScreen: {
      launchAutoHide: false, // 자동 숨김 방지
      launchShowDuration: 30000,
      backgroundColor: '#ffffffff',
      showSpinner: false,
    },
  },
}

export default config

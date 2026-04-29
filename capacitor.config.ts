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
      resize: KeyboardResize.None,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#6C51F0',
      showSpinner: false,
    },
  },
}

export default config

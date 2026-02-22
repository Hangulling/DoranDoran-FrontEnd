import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.koach.app',
  appName: 'K-oach',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
    androidScheme: 'https',
    allowNavigation: ['api.doran-chat.com', '*.doran-chat.com'],
  },
  plugins: {
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
  },
}

export default config

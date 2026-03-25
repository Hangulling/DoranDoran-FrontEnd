import { initializeApp } from 'firebase/app'
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
} from 'firebase/remote-config'
import { FIREBASE_CONFIG, IS_PROD } from '../constants/env'

// Firebase 초기화
const app = initializeApp(FIREBASE_CONFIG)
export const remoteConfig = getRemoteConfig(app)

// 캐시 유효 시간 설정
remoteConfig.settings.minimumFetchIntervalMillis = IS_PROD ? 3600000 : 0

// 실시간 점검 모드 여부를 확인
export const checkMaintenanceMode = async (): Promise<boolean> => {
  try {
    // 서버에서 최신 설정값 가져오기
    await fetchAndActivate(remoteConfig)

    // 환경별로 다른 키값 사용
    const configKey = IS_PROD ? 'is_maintenance_prod' : 'is_maintenance_dev'
    return getValue(remoteConfig, configKey).asBoolean()
  } catch (error) {
    console.error('Remote Config를 불러오는데 실패했습니다:', error)
    return false // 에러 발생 시 서비스 정상 운영을 위해 false 반환
  }
}

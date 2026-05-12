import UIKit
import Capacitor
import FirebaseCore
import GoogleSignIn
import FirebaseMessaging
import FBSDKCoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Firebase 초기화
        print("[iOS FCM] [STEP1] FirebaseApp.configure() 호출")
        FirebaseApp.configure()
        print("[iOS FCM] [STEP1] FirebaseApp.configure() 완료")

        // MessagingDelegate 등록 (토큰 갱신 감지)
        Messaging.messaging().delegate = self
        print("[iOS FCM] [STEP1] Messaging.delegate 설정 완료")

				// Meta(Facebook) SDK 설정 추가
        ApplicationDelegate.shared.application(
            application,
            didFinishLaunchingWithOptions: launchOptions
        )
				Settings.shared.isAutoLogAppEventsEnabled = true
    		Settings.shared.isAdvertiserIDCollectionEnabled = true

        return true
    }

    // APNs 디바이스 토큰 수신
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenHex = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        let tokenPreview = String(tokenHex.prefix(16))
        print("[iOS FCM] [STEP2] APNs 토큰 수신 성공: \(tokenPreview)... (len=\(tokenHex.count))")

        // APNs 토큰 → FCM SDK 연결
        Messaging.messaging().apnsToken = deviceToken
        print("[iOS FCM] [STEP3] Messaging.apnsToken 설정 완료 — FCM SDK가 APNs 토큰 인식")

        // FCM 토큰 즉시 확인
        Messaging.messaging().token { fcmToken, error in
            if let error = error {
                print("[iOS FCM] [STEP4] FCM 토큰 조회 실패: \(error.localizedDescription)")
                print("[iOS FCM] [STEP4] 확인사항: Firebase Console → 프로젝트 설정 → iOS 앱 → APNs 인증키 등록 여부")
            } else if let fcmToken = fcmToken {
                let preview = String(fcmToken.prefix(20))
                print("[iOS FCM] [STEP4] FCM 토큰 확인됨: \(preview)... (len=\(fcmToken.count))")
                print("[iOS FCM] [STEP4] ✓ APNs→FCM 연결 성공 — Capacitor FCM.getToken()이 이 값을 반환할 예정")
            }
        }

        // Capacitor 플러그인으로 토큰 전달
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        print("[iOS FCM] [STEP3] capacitorDidRegisterForRemoteNotifications 이벤트 발송 완료")
    }

    // APNs 등록 실패
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[iOS FCM] [STEP2] APNs 토큰 발급 실패: \(error.localizedDescription)")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    // MessagingDelegate: FCM 토큰 갱신 감지
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        let preview = fcmToken.map { String($0.prefix(20)) } ?? "nil"
        print("[iOS FCM] [TOKEN REFRESH] FCM 토큰 갱신됨: \(preview)... (len=\(fcmToken?.count ?? 0))")
    }

    // 구글 로그인 및 Capacitor 딥링크 처리
    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {

				if ApplicationDelegate.shared.application(app, open: url, options: options) {
            return true
        }

        if GIDSignIn.sharedInstance.handle(url) {
            return true
        }

        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application,
                                                          continue: userActivity,
                                                          restorationHandler: restorationHandler)
    }
}
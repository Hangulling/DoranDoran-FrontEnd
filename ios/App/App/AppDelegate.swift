import UIKit
import Capacitor
import FirebaseCore
import GoogleSignIn
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        return true
    }

    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {

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

		func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Capacitor 플러그인으로 토큰 전달
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Firebase에 APNs 토큰 등록
        Messaging.messaging().apnsToken = deviceToken
    }

		func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
				NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
		}
}

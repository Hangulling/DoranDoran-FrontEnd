-dontobfuscate
-ignorewarnings
-dontwarn **

# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Please add these rules to your existing keep rules in order to suppress warnings.
# This is generated automatically by the Android Gradle plugin.
-dontwarn com.facebook.AccessToken$AccessTokenRefreshCallback
-dontwarn com.facebook.AccessToken
-dontwarn com.facebook.CallbackManager$Factory
-dontwarn com.facebook.CallbackManager
-dontwarn com.facebook.FacebookCallback
-dontwarn com.facebook.FacebookSdk
-dontwarn com.facebook.GraphRequest$GraphJSONObjectCallback
-dontwarn com.facebook.GraphRequest
-dontwarn com.facebook.GraphRequestAsyncTask
-dontwarn com.facebook.login.LoginBehavior
-dontwarn com.facebook.login.LoginManager

# 1. R8/ProGuard 최적화 및 검증 비활성화 (가장 강력한 조치)
-dontoptimize
-dontshrink
-dontpreverify

# 2. 모든 Capacitor 플러그인 보존
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.** { *; }

# 3. @capgo/capacitor-social-login 보존
-keep class ee.forgr.capacitor.sociallogin.** { *; }
-keep interface ee.forgr.capacitor.sociallogin.** { *; }

# 4. Google & Firebase - 패키지 전체를 로직 포함하여 보존 (가장 확실함)
-keep class com.google.android.gms.** { *; }
-keep interface com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }

# 5. 애플 로그인 및 브라우저 통신 관련 보존
-keep class androidx.browser.** { *; }
-keep class com.google.android.gms.auth.api.signin.internal.** { *; }

# 6. 자바 표준 및 어노테이션 유지
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses, SourceFile, LineNumberTable
-keep class java.lang.Integer { *; }
-keep class java.lang.Long { *; }

# 7. 경고 무시
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
-dontwarn ee.forgr.capacitor.sociallogin.**
-dontwarn androidx.browser.**
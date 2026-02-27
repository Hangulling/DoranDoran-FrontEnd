import { useEffect, useState } from 'react'
import Button from '../common/Button'
import CloseIcon from '../../assets/icon/CloseIcon'
import TermTable from '../../assets/auth/termTable.png'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const PrivacyPolicy: React.FC = () => {
  const [imgOpen, setImgOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!imgOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [imgOpen])

  return (
    <div className="max-w-4xl mx-auto text-gray-800 leading-relaxed">
      <div className="text-2xl text-display mb-3">K-oach Privacy Policy</div>

      <div className="mb-10">
        <p className="text-body text-sm">
          Effective Date: February 1, 2026 (Example)
        </p>
        <p className="text-body text-sm">
          Personal Information Controller: K-oach Operator (Project Team)
          (hereinafter referred to as the “Company”)
        </p>
        <p className="text-body text-sm">
          Inquiries regarding Personal Information Protection (Controller): Yu
          seojeong / Email: info.koach11@gmail.com
        </p>
        <p className="text-body text-sm">
          K-oach Operator (Project Team) (hereinafter referred to as the
          “Company”) complies with the 「Personal Information Protection Act」
          and other relevant laws and regulations, processing personal
          information lawfully and securely. This Privacy Policy outlines the
          items of personal information processed by the Company, the purposes,
          retention period, collection methods, destruction procedures and
          methods, and measures for ensuring safety.
        </p>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          1. Items of Personal Information Collected
        </div>
        <div className="text-body text-sm mb-3">
          The Company may collect and use the personal information below to
          provide services.
        </div>
        <ol>
          <li>
            <div className="text-display text-base mb-3">
              (1) Information Required for Sign-up and Social Login
            </div>
            <ul className="text-body text-sm list-disc mb-3 ml-6 space-y-3">
              <li>
                In-app Sign-up (Required)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>
                    Name: For user identification and display within services
                    (My Page, etc.)
                  </li>
                  <li>
                    Date of Birth: For confirming whether the user is 14 years
                    or older and for analyzing service age demographics.
                  </li>
                  <li>Email (ID), Password</li>
                  <li>
                    Personal Questions and Answers (For providing an email
                    recovery function)
                  </li>
                  <li>
                    Consent History (Terms of Service / Privacy Policy / Age 14+
                    / Marketing (Optional) / Overseas Transfer of Personal
                    Information (Optional))
                  </li>
                </ul>
              </li>
              <li>
                Google OAuth Sign-up (Required)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>Google account email</li>
                  <li>Google profile information (Name, profile image) </li>
                  <li>OAuth token (For authentication processing)</li>
                  <li>
                    Date of Birth: For confirming whether the user is 14 years
                    or older and for analyzing service age demographics.
                  </li>
                  <li>
                    Consent History (Terms of Service / Privacy Policy / Age 14+
                    / Marketing (Optional) / Overseas Transfer of Personal
                    Information (Optional))
                  </li>
                </ul>
              </li>
              <li>
                When using Account Recovery/Security Features
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>
                    Password Reset: Email, email verification information
                    (verification code, etc.)
                  </li>
                  <li>
                    Email Recovery: Name, Date of Birth, Personal Question
                    Answer
                  </li>
                </ul>
              </li>
              <li>
                Information Generated and Collected During Service Use
                (Required/As necessary for operation)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>User UUID and Account Identifier (User ID)</li>
                  <li>Login Records / Access Logs</li>
                  <li>Device Information (OS, etc.), App Version</li>
                  <li>
                    Error / Diagnostic Information (For operational and security
                    purposes)
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <div className="text-display text-base mb-3">
              (2) Information Required for Service Use and Inquiries
            </div>
            <ul className="text-body text-sm list-disc ml-6 mb-3 space-y-3">
              <li>
                Service Use (Conversation/Save/Settings/Report)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>
                    User chat content and conversation history (text entered by
                    the user)
                  </li>
                  <li>
                    AI chatbot responses and Korean correction results (text)
                  </li>
                  <li>
                    Bookmarked expression data (sentences/words in saved box)
                    and filter/delete history
                  </li>
                  <li>
                    Bookmarked expression data (sentences/words in saved box)
                    and filter/delete history
                  </li>
                </ul>
              </li>
              <li>
                Inquiry Chat Room (Service Manager)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>Inquiry type, inquiry content, processing history.</li>
                  <li>
                    (Optional) Email to receive reply (collected separately from
                    account email)
                  </li>
                </ul>
              </li>
              <li>
                Push Notifications (Collected upon optional consent/settings)
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>Device Token</li>
                  <li>User Identifier (User ID)</li>
                  <li>Notification reception setting information</li>
                  <li>
                    (Optional) Marketing reception consent history (push by
                    default, email notification possible if needed)
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <div className="text-body text-sm border-l-2 border-gray-700 px-3 mb-3">
            ※ The Company does not provide camera/microphone shooting or
            recording functions and does not collect voice/video data.
          </div>
          <li>
            <div className="text-display text-base mb-3">
              (3) Collection and Transfer of Existing Web Service Account
              Information (For the purpose of fulfilling service usage
              agreements
            </div>
            <ul className="text-body text-sm list-disc ml-6 mb-3 space-y-3">
              <li>
                <ul className="list-disc list-inside mt-3">
                  <li>
                    Member account information (email, UUID, etc.) created in an
                    existing web service (e.g., "Dorandoran") operated by the
                    same entity.
                  </li>
                </ul>
              </li>
              <li>
                Purpose: To provide automatic login and continuous service
                experience in the K-oach app without separate registration.
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          2. Purpose of Collecting and Using Personal Information
        </div>
        <div className="text-body text-sm mb-3">
          The Company collects and uses personal information for the following
          purposes:
        </div>
        <ul className="text-body text-sm list-disc list-inside space-y-3">
          <li>
            Member registration and account management (identification,
            verification of age 14+, age demographic analysis, authentication,
            password reset, transfer of account information and automatic login
            between existing web services and the K-oach app, email recovery,
            etc.)
          </li>
          <li>
            Service provision and operation (providing AI chat service,
            tone/friendliness correction, word explanation, saving to inbox,
            applying settings, etc.), improving chatbot quality, and enhancing
            AI performance.
          </li>
          <li>
            Handling and responding to customer inquiries (receiving inquiries
            via service manager, emailing replies if "receive reply" is
            selected)
          </li>
          <li>
            Service stability, security, and quality improvement (error
            analysis, prevention of unauthorized use, analysis of conversation
            history to improve chatbot quality, etc.)
          </li>
          <li>
            Notices and announcements (updates/policy changes/inquiry replies,
            etc.)
          </li>
          <li>
            (Upon optional consent) Sending marketing notifications (push by
            default, email notification possible if needed)
          </li>
        </ul>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">3. Retention Period </div>
        <div className="text-body text-sm mb-3">
          The Company, as a principle, promptly destroys personal information
          once the retention period expires or the processing purpose is
          achieved.
        </div>
        <ol className="text-body text-sm list-inside space-y-3">
          <li>
            <div className="text-display text-base mb-3">
              3-1) Retention Period Based on K-oach Service Operation Standards
            </div>
            <ul className="list-disc space-y-3 ml-6">
              <li>
                Member registration information (account information): Personal
                identifiable information such as name and email is destroyed
                immediately upon member withdrawal.
              </li>
              <li>
                Web member account information (applicable only to existing web
                members): Destroyed immediately upon member withdrawal.
              </li>
              <li>
                Service usage data
                <ul className="list-disc ml-6 mt-3 space-y-3">
                  <li>
                    Chat contents and conversation records (including for
                    quality improvement purposes): Retained for the most recent
                    90 days during the service use period. After member
                    withdrawal, only pseudonymized or anonymized data that
                    cannot identify individuals is stored separately, and all
                    data is destroyed within 3 months.
                  </li>
                  <li>
                    Bookmarked expression data (saved items): Destroyed
                    immediately upon member withdrawal.
                  </li>
                </ul>
              </li>
              <li>
                Inquiry data (inquiry content/reply email/processing history):
                Regardless of member withdrawal, all inquiry-related data is
                retained for 3 months after processing completion and then
                destroyed.
              </li>
              <li>
                Push-related information (device token/notification settings):
                Destroyed without delay upon withdrawal of notification consent
                or logout/member withdrawal (or retained for the minimum period
                necessary for service operation and then destroyed).
              </li>
            </ul>
          </li>
          <li>
            <div className="text-display text-base mb-3">
              3-2{')'} Retention According to Law
            </div>
            <ul className="list-disc ml-6 space-y-3">
              <li>Personal Information Item: Login records</li>
              <li>Retention Period: 3 months</li>
              <li>
                Legal Basis: Article 15-2 of the Protection of Communications
                Secrets Act, Article 41, Paragraph 2, Subparagraph 2 of the
                Enforcement Decree of the same Act
              </li>
            </ul>
          </li>
        </ol>
        <div className="text-body text-sm border-l-2 border-gray-700 px-3 mt-3">
          ※ K-oach currently has no advertising, contracts, or payments (paid
          services), so e-commerce related transaction record retention
          provisions do not apply.
        </div>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          4. Personal Information Collection Methods
        </div>
        <div className="text-body text-sm mb-3">
          The Company collects personal information through the following
          methods:
        </div>
        <ul className="text-body text-sm list-disc list-inside space-y-3">
          <li>
            Direct input by the user during the sign-up and service use process
            (name, date of birth, email, password, personal questions/answers,
            consent history, etc.)
          </li>
          <li>
            Service provision and operation (providing AI chat service,
            Receiving information provided at the user's discretion during
            Google OAuth social login (Google account email, profile
            information, OAuth token, etc.)
          </li>
          <li>
            Collecting information written and submitted by the user during
            service use (chat content/saved data/reports/inquiries/reply emails,
            etc.)
          </li>
          <li>
            Collecting information automatically generated during service use
            (login records, access logs, device/OS information, app version,
            error/diagnostic information, etc.)
          </li>
          <li>
            Collecting information generated and collected during the push
            notification setting/consent process (Device Token, notification
            reception setting information, etc.)
          </li>
        </ul>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          5. Personal Information Destruction Procedures and Methods
        </div>
        <div className="text-body text-sm mb-3">
          The Company destroys personal information without delay when it
          becomes unnecessary, such as when the retention period expires or the
          purpose of processing has been achieved.
        </div>
        <ul className="text-body text-sm list-disc list-inside space-y-3">
          <li>
            Destruction Procedure: Purpose achieved/Retention period ended →
            Review internal policies and laws → Destruction
          </li>
          <li>
            Destruction Methods
            <ul className="list-disc list-inside ml-6 mt-3 space-y-3">
              <li>
                Electronic file format: Permanently deleted using a method that
                makes recovery impossible.
              </li>
              <li>
                Printed materials: Shredded or incinerated (if applicable).
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="text-body text-sm mb-10">
        <div className="text-display text-2xl mb-3">
          6. Measures to Ensure the Security of Personal Information
        </div>
        <div className="mb-3">
          The Company takes the following measures to manage personal
          information securely:
        </div>
        <ul className="list-disc list-inside space-y-3">
          <li>
            Minimization of personnel handling personal information and
            management of access rights (granting/changing/revoking).
          </li>
          <li>
            Authentication information such as passwords are securely stored by
            one-way encryption (hashing), making decryption impossible, and
            transmission sections are protected (applying encryption and other
            possible protection measures).
          </li>
          <li>
            Access control to personal information processing systems (applying
            authentication methods, blocking unauthorized access).
          </li>
          <li>
            Storage and inspection of access records, measures to prevent
            alteration.
          </li>
          <li>
            Installation of security programs and technical protection measures
            such as vulnerability checks.
          </li>
          <li>
            Establishment and training of internal management plans (applied
            within project scope).
          </li>
        </ul>
      </div>

      <div className="text-body text-sm mb-10 space-y-3">
        <div className="text-display text-2xl">
          7. Entrustment of Personal Information Processing and Overseas
          Transfer
        </div>
        <div>
          The Company may entrust some personal information processing tasks to
          external businesses for service provision and enhancement. In such
          cases, the Company carries out contracts and management/supervision in
          accordance with the 「Personal Information Protection Act」 and
          discloses the entrusted parties and their tasks.
        </div>
        <div>
          In particular, some of the external businesses listed below are
          located overseas, meaning personal information may be processed or
          transferred overseas (including processing via network transmission).
          The Company obtains separate consent from the data subject (member) in
          accordance with relevant laws and manages the information to ensure
          secure processing.
        </div>
        <div className="text-body text-sm border-l-2 border-gray-700 px-3">
          (Data subjects have the right to refuse consent to the overseas
          transfer of personal information, and service use may be restricted if
          consent is refused.)
        </div>
        <div className="text-display text-base">
          1) Entrusted Parties and Tasks
        </div>
        <div className="flex justify-center">
          <img
            src={TermTable}
            alt="policyTerm"
            onClick={() => setImgOpen(true)}
          />
        </div>
        <div>
          If there are changes in the entrusted tasks or entrusted parties, this
          Privacy Policy will be updated and disclosed without delay.
        </div>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          8. Membership Withdrawal and Personal Information Destruction
        </div>
        <ol className="text-body text-sm list-decimal list-inside space-y-3">
          <li>
            Members can request to withdraw from the service at any time through
            My Page (MY) {'>'} My Profile {'>'} Delete account menu.
          </li>
          <li>
            Upon withdrawal, personal information collected at sign-up and
            generated during service use that can identify individuals (e.g.,
            name, email) is destroyed immediately.
          </li>
          <li>
            Data that is pseudonymized or anonymized so that it cannot identify
            individuals after withdrawal is separately retained for 3 months for
            purposes such as service improvement and statistical analysis, and
            destroyed promptly after the retention period expires.
          </li>
          <li>
            Members may re-register with the same ID at any time after
            withdrawal.
          </li>
        </ol>
        <div className="text-body text-sm mb-3">
          Please refer to the bottom of the page for detailed information.
        </div>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          9. Method of Exercising Data Subject Rights
        </div>
        <div className="text-body text-sm mb-3">
          Data subjects (members) can exercise the following rights related to
          personal information protection against the Company at any time:
        </div>
        <ul className="text-body text-sm list-disc list-inside space-y-3 mb-3">
          <li>Request to view personal information</li>
          <li>Request correction and deletion if there are errors, etc.</li>
          <li>Request suspension of processing</li>
        </ul>
        <div className="text-body text-sm">
          The Company will take action without delay regarding the exercise of
          data subject rights, in accordance with the 「Personal Information
          Protection Act」 and other related laws and regulations.
        </div>
      </div>

      <div className="mb-10">
        <div className="text-display text-2xl mb-3">
          10. Installation, Operation, and Refusal of Automated Personal
          Information Collection Devices
        </div>
        <p className="text-body text-sm mb-3">
          The Company may install and operate automated collection devices
          (cookies) and analytical tools (Google Analytics) to improve users'
          service experience, provide customized services by analyzing service
          usage patterns and traffic, and utilize them for marketing activities.
        </p>
        <ol>
          <li>
            <div className="text-display text-base mb-3">
              1{')'} Operation of Cookies
            </div>
            <ul className="text-body text-sm list-disc mb-3 ml-6 space-y-3">
              <li>
                What is a Cookie?: A very small text file sent by the server
                operating a website to the user's computer browser, which is
                stored on the user's computer's hard disk.
              </li>
              <li>
                Purpose of using Cookies: Analyzing user access frequency or
                visit time, identifying user preferences and interests, and
                using them as a criterion for service reorganization.
              </li>
              <li>
                Installation/Operation and Refusal of Cookies: Users have the
                right to choose whether to install cookies. Therefore, users can
                allow all cookies, confirm each time a cookie is stored, or
                refuse to store all cookies by setting options in their web
                browser.
              </li>
              <li className="ml-6">
                How to Set: [Example web browser settings - (e.g., for Chrome:
                Settings {'>'} Privacy and security{'>'} Cookies and other site
                data)]
              </li>
            </ul>
          </li>
          <li className="text-display text-base">
            <div className="mb-3">2{')'} Operation of Google Analytics</div>
            <ul className="text-body text-sm list-disc ml-6 mb-3 space-y-3">
              <li>
                Collected Items: Service usage records, access frequency, access
                time, device information, IP address (partially anonymized), app
                version, error information, etc.
              </li>
              <li>
                Collection Purpose: Service improvement through user behavior
                analysis, feature optimization, marketing performance
                measurement.
              </li>
              <li>
                How to Refuse:
                <ul className="list-disc ml-6 mt-2 space-y-3">
                  <li>
                    You can refuse by installing the Google Analytics Opt-out
                    Browser Add-on (for web browsers).
                  </li>
                  <li>
                    If the app provides a setting menu to refuse Google
                    Analytics data collection, that method will be guided.
                  </li>
                  <li>
                    (If there is no in-app setting) You can restrict
                    personalized advertising and app analytics tracking through
                    your device's operating system settings (e.g., iOS Limit Ad
                    Tracking, Android Reset Advertising ID).
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>
        <div className="text-body text-sm">
          The Company uses information collected through Google Analytics only
          for statistical analysis and service improvement purposes, and does
          not collect information that directly identifies individuals.
        </div>
      </div>

      <div>
        <div className="text-display text-2xl mb-3">
          11. Matters Concerning Changes to the Privacy Policy
        </div>
        <div className="text-body text-sm">
          This Privacy Policy will be announced through a notice screen within
          the service, pop-ups, push notifications, or email 7 days prior to the
          effective date of changes, if additions, deletions, or corrections are
          made due to laws and policies. However, in cases of significant
          changes to data subject rights, such as the collection and utilization
          of personal information, or provision to third parties, notification
          will be made at least 30 days in advance.
        </div>
      </div>

      {imgOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-800/80 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <Button
            variant="text"
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-white"
            onClick={e => {
              e.stopPropagation()
              setImgOpen(false)
            }}
            aria-label="Close image viewer"
          >
            <CloseIcon />
          </Button>

          <div
            className="bg-white  p-3 overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <TransformWrapper
              minScale={1}
              maxScale={4}
              doubleClick={{ mode: 'zoomIn' }}
              wheel={{ disabled: true }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  touchAction: 'none',
                }}
              >
                <img
                  src={TermTable}
                  alt="Entrusted parties and tasks enlarged"
                  className=" max-h-[85vh] object-contain select-none"
                  draggable={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrivacyPolicy

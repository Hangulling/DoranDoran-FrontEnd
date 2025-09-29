import { useState } from 'react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Agreement, { type AgreementValue } from '../components/common/Agreement'
import { validateEmail, validateName } from '../utils/validations'
import CommonModal from '../components/common/CommonModal'
import { useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')

  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [pwdTouched, setPwdTouched] = useState(false)
  const [pwdCheckTouched, setPwdCheckTouched] = useState(false)

  const [openModal, setOpenModal] = useState(false)

  const [agreements, setAgreements] = useState<AgreementValue>({
    service: false,
    privacy: false,
    marketing: false,
  })

  const navigate = useNavigate()

  const handleFirstNameChange = (v: string) => {
    setFirstName(v)
    if (firstNameError && validateName(v) === null) setFirstNameError(null)
  }
  const handleLastNameChange = (v: string) => {
    setLastName(v)
    if (lastNameError && validateName(v) === null) setLastNameError(null)
  }
  const handleEmailChange = (v: string) => {
    setEmail(v)
    if (emailError && validateEmail(v) === null) setEmailError(null)
    setEmailSuccess(null)
  }
  const handleEmailBlur = () => {
    const err = validateEmail(email)
    setEmailError(err)
    if (err) setEmailSuccess(null)
  }
  const handleVerify = () => {
    const err = validateEmail(email) || (email.trim() === '' ? 'Please enter your email.' : null)
    if (err) {
      setEmailError(err)
      setEmailSuccess(null)
      return
    }
    setEmailError(null)
    setEmailSuccess('Verified successfully.')
  }
  const isEmailFormatValid = email.trim() !== '' && validateEmail(email) === null

  const pwdLenError =
    pwdTouched && password.length > 0 && (password.length < 8 || password.length > 20)

  const pwdMatchError =
    pwdCheckTouched && passwordCheck.length > 0 && !pwdLenError && password !== passwordCheck

  const passwordHelper = pwdLenError
    ? password.length < 8
      ? 'Must be at least 8 characters.'
      : 'Must be 20 characters or fewer.'
    : pwdMatchError
      ? 'Passwords do not match.'
      : null

  const passwordsMatch =
    pwdCheckTouched &&
    password.length >= 8 &&
    password.length <= 20 &&
    passwordCheck.length > 0 &&
    password === passwordCheck

  const requiredAgreed = agreements.service && agreements.privacy

  const isPasswordLenValid = password.length >= 8 && password.length <= 20
  const isPasswordValidForSubmit =
    isPasswordLenValid && passwordCheck.length > 0 && password === passwordCheck

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    validateName(firstName) === null &&
    validateName(lastName) === null &&
    validateEmail(email) === null &&
    isPasswordValidForSubmit &&
    requiredAgreed
  const handleOpenModal = () => {
    if (!isFormValid) return
    setOpenModal(true)
  }

  const handleConfirmModal = () => {
    setOpenModal(false)
    handleSubmit()
  }

  const handleSubmit = () => {
    if (!isFormValid) return
    navigate('/login')
    console.log('submit', {
      firstName,
      lastName,
      email,
      agreements,
    })
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col justify-center items-center">
        <div>
          <Input
            type="text"
            label="First name"
            variant={firstNameError ? 'error' : 'primary'}
            placeholder="Enter your first name"
            onChange={e => handleFirstNameChange(e.target.value)}
            onBlur={() => setFirstNameError(validateName(firstName))}
            value={firstName}
          />
          {firstNameError && <span className="text-xs text-orange-300">{firstNameError}</span>}
        </div>

        <div>
          <Input
            type="text"
            label="Last name"
            placeholder="Enter your last name"
            variant={lastNameError ? 'error' : 'primary'}
            onChange={e => handleLastNameChange(e.target.value)}
            onBlur={() => setLastNameError(validateName(lastName))}
            value={lastName}
          />
          {lastNameError && <span className="text-xs text-orange-300">{lastNameError}</span>}
        </div>

        <div className="w-[335px]">
          <div className="flex items-end justify-between">
            <Input
              type="email"
              label="E-mail"
              placeholder="Enter your E-mail"
              size="md"
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              variant={emailError ? 'error' : 'primary'}
            />
            <Button
              variant="primary"
              disabled={!isEmailFormatValid}
              className="bg-gray-800 my-2"
              size="sm"
              onClick={handleVerify}
            >
              Verify
            </Button>
          </div>
          {emailError ? (
            <span className="text-xs text-orange-300">{emailError}</span>
          ) : emailSuccess ? (
            <span className="text-xs text-blue-500">{emailSuccess}</span>
          ) : null}
        </div>

        <div className="w-[335px]">
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password (8-20 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setPwdTouched(true)}
            variant={pwdLenError || pwdMatchError ? 'error' : 'primary'}
          />
        </div>

        <div className="w-[335px]">
          <Input
            type="password"
            placeholder="Enter your password (8-20 characters)"
            value={passwordCheck}
            onChange={e => setPasswordCheck(e.target.value)}
            onBlur={() => setPwdCheckTouched(true)}
            variant={pwdMatchError ? 'error' : 'primary'}
          />
          {passwordHelper ? (
            <span className="text-orange-300 text-xs">{passwordHelper}</span>
          ) : (
            passwordsMatch && <span className="text-blue-500 text-xs">Passwords match.</span>
          )}
        </div>

        <div className="my-2">
          <Agreement value={agreements} onChange={setAgreements} />
        </div>

        <div className="m-2 ">
          <Button
            type="submit"
            className="bg-gray-800"
            variant="primary"
            disabled={!isFormValid}
            size="xl"
            onClick={handleOpenModal}
          >
            Sign Up
          </Button>
        </div>
        {openModal && (
          <CommonModal
            variant="signup"
            open
            title="Sign Up Complete"
            confirmText="Start"
            description="Welcome! Ready to start Chatting?"
            onCancel={() => setOpenModal(false)}
            onConfirm={handleConfirmModal}
          />
        )}
      </div>
    </div>
  )
}

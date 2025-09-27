import { useState } from 'react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Agreement, { type AgreementValue } from '../components/common/Agreement'
import { validateEmail, validateName } from '../utils/validations'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')

  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const [pwdTouched, setPwdTouched] = useState(false)
  const [pwdCheckTouched, setPwdCheckTouched] = useState(false)

  const [agreements, setAgreements] = useState<AgreementValue>({
    service: false,
    privacy: false,
    marketing: false,
  })

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
  }
  const handleEmailBlur = () => setEmailError(validateEmail(email))

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

  const handleSubmit = () => {
    if (!isFormValid) return
    alert('회원가입')
    console.log('submit', {
      firstName,
      lastName,
      email,
      agreements,
    })
  }

  return (
    <div className="flex justify-center items-center">
      <div className="bg-gray flex flex-col justify-center items-center ">
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
          <div className="flex items-end gap-2">
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
            >
              Verify
            </Button>
          </div>
          {emailError && <span className="text-xs text-orange-300">{emailError}</span>}
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
            className="bg-gray-800"
            variant="primary"
            disabled={!isFormValid}
            size="xl"
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}

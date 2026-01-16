import { useEffect, useState } from 'react'
import Input from '../../../components/common/Input'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import FormIntro from '../../../components/common/FormIntro'
import { PASSWORD_REGEX } from '../../../utils/validations'
import { useOutletContext } from 'react-router-dom'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
}

export default function SignupPassword() {
  const { password, passwordCheck, setMany } = useSignupFormStore()
  const [pwdTouched, setPwdTouched] = useState(false)
  const [pwdCheckTouched, setPwdCheckTouched] = useState(false)
  const [, setPwdError] = useState<string | null>(null)
  const [, setPwdCheckError] = useState<string | null>(null)
  const { setCanSubmit } = useOutletContext<OutletContext>()

  const handlePasswordChange = (v: string) => {
    const value = v.replace(/\s+/g, '')
    setMany({ password: value })
    setPwdTouched(true)

    if (value.length === 0) setPwdError(null)
    else if (value.length < 8) setPwdError('Must be at least 8 characters.')
    else if (value.length > 20) setPwdError('Must be 20 characters or fewer.')
    else if (!PASSWORD_REGEX.test(value))
      setPwdError('Please check your password format.')
    else setPwdError(null)

    if (passwordCheck.length > 0) {
      setPwdCheckTouched(true)
      setPwdCheckError(
        value === passwordCheck ? null : 'Passwords do not match.'
      )
    }
  }

  const handlePasswordCheckChange = (v: string) => {
    const value = v.replace(/\s+/g, '')
    setMany({ passwordCheck: value })
    setPwdCheckTouched(true)

    const baseOk = PASSWORD_REGEX.test(password)
    if (baseOk)
      setPwdCheckError(password === value ? null : 'Passwords do not match.')
    else setPwdCheckError(null)
  }

  const pwdFormatError =
    pwdTouched && password.length > 0 && !PASSWORD_REGEX.test(password)
  const pwdMatchError =
    pwdCheckTouched &&
    passwordCheck.length > 0 &&
    !pwdFormatError &&
    password !== passwordCheck

  const passwordHelper = pwdFormatError
    ? 'Please check your password format.'
    : pwdMatchError
      ? 'Passwords do not match.'
      : null

  const passwordsMatch =
    pwdCheckTouched &&
    PASSWORD_REGEX.test(password) &&
    passwordCheck.length > 0 &&
    password === passwordCheck

  const isPasswordValidForSubmit =
    PASSWORD_REGEX.test(password) &&
    passwordCheck.length > 0 &&
    password === passwordCheck

  const isFormValid = isPasswordValidForSubmit

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <FormIntro>
        <p>Create your password.</p>
      </FormIntro>

      <Input
        type="password"
        variant={pwdFormatError || pwdMatchError ? 'error' : 'primary'}
        placeholder="Enter 8-20 characters & letters+numbers"
        value={password}
        onChange={e => handlePasswordChange(e.target.value)}
        onBlur={() => setPwdTouched(true)}
      />
      <Input
        type="password"
        variant={pwdFormatError || pwdMatchError ? 'error' : 'primary'}
        placeholder="Enter 8-20 characters & letters+numbers"
        value={passwordCheck}
        onChange={e => handlePasswordCheckChange(e.target.value)}
        onBlur={() => setPwdCheckTouched(true)}
      />
      {passwordHelper ? (
        <span className="text-system-red  text-body text-xs">
          {passwordHelper}
        </span>
      ) : (
        passwordsMatch && (
          <span className="text-system-blue text-body text-xs">
            Passwords match.
          </span>
        )
      )}
    </div>
  )
}

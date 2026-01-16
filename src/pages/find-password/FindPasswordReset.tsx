import { useCallback, useEffect, useState } from 'react'
import Input from '../../components/common/Input'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'
import { PASSWORD_REGEX, validatePassword } from '../../utils/validations'
import { resetPassword } from '../../api'
import { useNavigate, useOutletContext } from 'react-router-dom'
import FormIntro from '../../components/common/FormIntro'
import CommonModal from '../../components/common/CommonModal'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindPasswordReset() {
  const { password, passwordCheck, setPassword, setPasswordCheck } =
    usePasswordResetStore()
  const { email, code } = usePasswordResetStore()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false)
  const { setSubmit, setCanSubmit } = useOutletContext<OutletContext>()
  const pwdFormatError = password.length > 0 && !PASSWORD_REGEX.test(password)
  const pwdMatchError =
    passwordCheck.length > 0 && !pwdFormatError && password !== passwordCheck

  const handlePasswordChange = (v: string) => {
    const value = v.replace(/\s+/g, '')
    setPassword(value)

    const err = validatePassword(value, passwordCheck)
    setPasswordError(err)
  }

  const handlePasswordCheckChange = (v: string) => {
    const value = v.replace(/\s+/g, '')
    setPasswordCheck(value)

    const err = validatePassword(password, value)
    setPasswordError(err)
  }

  const isFormValid =
    password.length > 0 &&
    passwordCheck.length > 0 &&
    PASSWORD_REGEX.test(password) &&
    password === passwordCheck

  const handleSubmit = useCallback(async () => {
    setOpenModal(false)

    try {
      const payload = {
        email,
        code,
        newPassword: password,
      }
      await resetPassword(payload)

      navigate('/login', {
        state: {
          toast: {
            message: 'Password changed successfully.',
            iconType: 'checkRound',
          },
        },
      })
    } catch (error) {
      console.log(error, 'error')
    }
  }, [email, code, password, navigate])

  useEffect(() => {
    setSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
        <p>Create your new password</p>
      </FormIntro>
      <div className="w-[335px]">
        <Input
          type="password"
          label="Reset your password"
          placeholder="Enter 8-20 characters & letters+numbers"
          value={password}
          onChange={e => handlePasswordChange(e.target.value)}
          variant={pwdFormatError || pwdMatchError ? 'error' : 'primary'}
        />
      </div>
      <div className="w-[335px]">
        <Input
          type="password"
          placeholder="Enter 8-20 characters & letters+numbers"
          value={passwordCheck}
          onChange={e => handlePasswordCheckChange(e.target.value)}
          variant={pwdMatchError ? 'error' : 'primary'}
        />
        {passwordError ? (
          <span className="text-system-red text-body text-xs">
            {passwordError}
          </span>
        ) : (
          password &&
          passwordCheck && (
            <span className="text-system-blue text-body text-xs">
              Passwords match.
            </span>
          )
        )}
      </div>
      {openModal && (
        <CommonModal
          variant="signup"
          open
          title="Password reset complete"
          confirmText="Start"
          description="It's all done! Ready to start chatting?"
          onCancel={() => setOpenModal(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  )
}

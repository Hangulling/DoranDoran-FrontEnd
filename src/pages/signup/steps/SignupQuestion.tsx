import { useCallback, useEffect, useMemo, useState } from 'react'
import Dropdown from '../../../components/common/Dropdown'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { Identity_Questions } from '../../../constants/IdentityQuestionData'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import { ANSWER_REGEX } from '../../../utils/validations'
import { useNavigate, useOutletContext } from 'react-router-dom'
import CommonModal from '../../../components/common/CommonModal'
import { createUser, login } from '../../../api'
import axios from 'axios'
import { useAgreementStore } from '../../../stores/useAgreementStore'
import { tokenService } from '../../../api/tokenService'
import { sendGAEvent } from '../../../utils/ga'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function SignupQuestion() {
  const {
    email,
    firstName,
    lastName,
    password,
    answer,
    identityQuestion,
    setMany,
    reset: resetForm,
  } = useSignupFormStore()

  const agreements = useAgreementStore(s => s.value)
  const resetAgreements = useAgreementStore(s => s.reset)

  const [answerError, setAnswerError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const { setSubmit, setCanSubmit } = useOutletContext<OutletContext>()
  const navigate = useNavigate()

  const handleAnswerChange = (v: string) => {
    if (v.length > 30) {
      setAnswerError('Input must not exceed 30 characters and number')
      return
    }

    if (v.length === 1 && v[0] === ' ') {
      return
    }

    if (v !== '' && !ANSWER_REGEX.test(v)) {
      setAnswerError('Only letters, numbers, and spaces are allowed')
      return
    }

    setAnswerError(null)
    setMany({ answer: v })
  }

  const handleConfirmModal = async () => {
    setSubmitError(null)

    try {
      const payload = {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        signupQuestion: identityQuestion,
        signupAnswer: answer,
        password,
        marketingOption: agreements.marketing,
      }

      await createUser(payload)

      setOpenModal(false)

      sendGAEvent('sign_up', {
        method: 'email',
      })

      const loginRes = await login({ email, password })

      if (!loginRes?.success) {
        navigate('/login', { replace: true })
        return
      }

      await tokenService.setLastLogin('email')
      const user = loginRes?.data?.user

      if (user?.isOnboard) {
        navigate('/')
      } else {
        navigate('/onboarding')
      }

      setTimeout(() => {
        resetForm()
        resetAgreements()
      }, 0)
    } catch (e: unknown) {
      const isAxios = axios.isAxiosError(e)
      const status = isAxios ? e.response?.status : undefined
      const data = isAxios ? e.response?.data : undefined
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || 'unknown error'

      const errorCode = status ?? 503

      if (status && status >= 400 && status < 500) {
        setOpenModal(false)
        setSubmitError(
          typeof message === 'string'
            ? message
            : 'Sign up failed. Please check your input.'
        )
        return
      }

      navigate('/error', {
        replace: true,
        state: { errorCode, from: 'signup' },
      })
    }
  }

  const isFormValid = useMemo(() => {
    const isQuestionSelected = identityQuestion.trim() !== ''
    const isAnswerValid = answer.trim() !== '' && answerError === null
    return isQuestionSelected && isAnswerValid
  }, [identityQuestion, answer, answerError])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  const handleOpenModal = useCallback(() => {
    if (!isFormValid) return
    setSubmitError(null)
    setOpenModal(true)
  }, [isFormValid])

  useEffect(() => {
    setSubmit(() => handleOpenModal)
  }, [setSubmit, handleOpenModal])

  return (
    <div>
      <FormIntro>
        <p>Choose a recovery question</p>
      </FormIntro>

      <div>
        <Dropdown
          label="Identity Verification Question"
          placeholder="Please select a question"
          options={Identity_Questions}
          variant={answerError || submitError ? 'error' : 'primary'}
          value={
            identityQuestion
              ? (Identity_Questions.find(q => q.value === identityQuestion) ??
                null)
              : null
          }
          onChange={q => setMany({ identityQuestion: q.value })}
        />

        <Input
          variant={answerError || submitError ? 'error' : 'primary'}
          type="text"
          placeholder="Please enter your answer"
          onChange={e => handleAnswerChange(e.target.value)}
          value={answer}
        />

        {answerError && (
          <span className="text-xs text-system-red">{answerError}</span>
        )}

        {submitError && (
          <span className="text-xs text-system-red">{submitError}</span>
        )}
      </div>

      {openModal && (
        <CommonModal
          variant="signup"
          open
          title="Sign Up Complete"
          confirmText="Start"
          description="Welcome! Ready to start chatting?"
          onCancel={() => setOpenModal(false)}
          onConfirm={handleConfirmModal}
        />
      )}
    </div>
  )
}

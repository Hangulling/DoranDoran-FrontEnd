import { useCallback, useEffect, useMemo, useState } from 'react'
import Dropdown from '../../../components/common/Dropdown'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { Identity_Questions } from '../../../constants/IdentityQuestionData'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import { ANSWER_REGEX } from '../../../utils/validations'
import { useNavigate, useOutletContext } from 'react-router-dom'
import CommonModal from '../../../components/common/CommonModal'
import { createUser } from '../../../api'
import axios from 'axios'
import { useAgreementStore } from '../../../stores/useAgreementStore'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function SignupQuestion() {
  const {
    email,
    firstName,
    lastName,
    birthDate,
    password,
    answer,
    identityQuestion,
    setMany,
    reset: resetForm,
  } = useSignupFormStore()
  const agreements = useAgreementStore(s => s.value)
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const { setSubmit, setCanSubmit } = useOutletContext<OutletContext>()
  const [, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const resetAgreements = useAgreementStore(s => s.reset)

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
    setOpenModal(false)
    setSubmitError(null)

    try {
      const payload = {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        birthDate: birthDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'),
        signupQuestion: identityQuestion,
        signupAnswer: answer,
        password,
        marketingOption: agreements.marketing,
      }

      await createUser(payload)

      navigate('/login', { replace: true })
      setTimeout(() => {
        resetForm()
        resetAgreements()
      }, 0)
    } catch (e: unknown) {
      const isAxios = axios.isAxiosError(e)
      const status = isAxios ? e.response?.status : undefined
      const errorCode = status ?? 503

      if (status && status >= 400 && status < 500) {
        return
      }

      navigate('/error', {
        replace: true,
        state: { errorCode: errorCode, from: 'signup' },
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
          variant={answerError ? 'error' : 'primary'}
          value={
            identityQuestion
              ? (Identity_Questions.find(q => q.value === identityQuestion) ??
                null)
              : null
          }
          onChange={q => setMany({ identityQuestion: q.value })}
        />
        <Input
          variant={answerError ? 'error' : 'primary'}
          type="text"
          placeholder="Please enter your answer"
          onChange={e => handleAnswerChange(e.target.value)}
          value={answer}
        />
        {answerError && (
          <span className="text-xs text-system-red">{answerError}</span>
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

import { useCallback, useEffect, useState } from 'react'
import Dropdown from '../../../components/common/Dropdown'
import FormIntro from '../../../components/common/FormIntro'
import { Identity_Questions } from '../../../constants/IdentityQuestionData'
import { useFindEmailStore } from '../../../stores/useFindEmailStore'
import Input from '../../../components/common/Input'
import { ANSWER_REGEX } from '../../../utils/validations'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { findEmail } from '../../../api'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindEmailQuestion() {
  const { firstName, lastName, birthDate, identityQuestion, answer, setMany } =
    useFindEmailStore()
  const [answerError, setAnswerError] = useState<string | null>(null)
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

  const handleSubmit = useCallback(async () => {
    try {
      const payload = {
        firstName,
        lastName,
        birthDate: birthDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'),
        signupQuestion: identityQuestion,
        signupAnswer: answer,
      }
      const res = await findEmail(payload)

      navigate('/find-email/success', {
        state: { email: res.data.email },
      })
    } catch (error) {
      console.log('error', error)
      navigate('/find-email/not-found')
    }
  }, [firstName, lastName, birthDate, identityQuestion, answer, navigate])

  const isFormValid = identityQuestion !== '' && ANSWER_REGEX.test(answer)

  useEffect(() => {
    setSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
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
      </div>{' '}
    </div>
  )
}

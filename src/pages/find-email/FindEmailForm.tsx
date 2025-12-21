import { useCallback, useEffect, useState } from 'react'
import Input from '../../components/common/Input'
import {
  ANSWER_REGEX,
  isPastDate,
  isValidCalendarDate,
  validateName,
} from '../../utils/validations'
import { Identity_Questions } from '../../constants/IdentityQuestionData'
import Dropdown from '../../components/common/Dropdown'
import { useFindEmailStore } from '../../stores/useFindEmailStore'
import { findEmail } from '../../api'
import { useNavigate, useOutletContext } from 'react-router-dom'

type OutletContext = {
  setOnSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindEmailForm() {
  const {
    firstName,
    lastName,
    birthDate,
    identityQuestion,
    answer,
    setMany,
    reset: resetForm,
  } = useFindEmailStore()
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [birthDateError, setBirthDateError] = useState<string | null>(null)
  const [answerError, setAnswerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setOnSubmit, setCanSubmit } = useOutletContext<OutletContext>()

  const handleFirstNameChange = (v: string) => {
    const noSpace = v.replace(/[^A-Za-z]/g, '')
    if (noSpace.length > 15) {
      setFirstNameError('Enter 1-15 characters.')
      return
    }
    setMany({ firstName: noSpace })
    if (firstNameError && validateName(noSpace) === null) setFirstNameError(null)
  }

  const handleLastNameChange = (v: string) => {
    const noSpace = v.replace(/[^A-Za-z]/g, '')
    if (noSpace.length > 15) {
      setLastNameError('Enter 1-15 characters.')
      return
    }
    setMany({ lastName: noSpace })
    if (lastNameError && validateName(noSpace) === null) setLastNameError(null)
  }

  const birthDateDisplay = birthDate.replace(/^(\d{4})(\d{0,2})(\d{0,2})$/, (_, y, m, d) =>
    [y, m, d].filter(Boolean).join('-')
  )

  const handleBirthDateChange = (v: string) => {
    const digits = v.replace(/\D/g, '')

    if (digits.length > 8) return

    setMany({ birthDate: digits })

    if (birthDateError && isPastDate(digits) === null && isValidCalendarDate(digits) === null) {
      setBirthDateError(null)
    }
  }

  const handleBirthDateBlur = (v: string) => {
    if (v.length < 8) {
      setBirthDateError('Please enter the date of birth in 8 digits')
      return
    }

    if (isPastDate(v) || isValidCalendarDate(v)) {
      setBirthDateError('Please enter a valid date')
    }
  }

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

  const isFormValid =
    validateName(firstName) === null &&
    validateName(lastName) === null &&
    birthDate.length === 8 &&
    isPastDate(birthDate) === null &&
    isValidCalendarDate(birthDate) === null &&
    identityQuestion !== '' &&
    ANSWER_REGEX.test(answer)

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

  useEffect(() => {
    setOnSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  useEffect(() => {
    resetForm()
  }, [])

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <Input
          type="text"
          label="First name *"
          variant={firstNameError ? 'error' : 'primary'}
          placeholder="Enter your first name (1-15 characters)"
          onChange={e => handleFirstNameChange(e.target.value)}
          onBlur={() => setFirstNameError(validateName(firstName))}
          value={firstName}
        />
        {firstNameError && <span className="text-xs text-orange-300">{firstNameError}</span>}
      </div>
      <div>
        <Input
          type="text"
          label="Last name *"
          placeholder="Enter your last name (1-15 characters)"
          variant={lastNameError ? 'error' : 'primary'}
          onChange={e => handleLastNameChange(e.target.value)}
          onBlur={() => setLastNameError(validateName(lastName))}
          value={lastName}
        />
        {lastNameError && <span className="text-xs text-orange-300">{lastNameError}</span>}
      </div>
      <div>
        <Input
          type="text"
          label="Date of Birth *"
          placeholder="YYYY-MM-DD"
          variant={birthDateError ? 'error' : 'primary'}
          inputMode="numeric"
          onChange={e => handleBirthDateChange(e.target.value)}
          onBlur={() => handleBirthDateBlur(birthDate)}
          value={birthDateDisplay}
        />
        {birthDateError && <span className="text-xs text-orange-300">{birthDateError}</span>}
      </div>
      <div className="pb-80">
        <Dropdown
          label="Identity Verification Question *"
          placeholder="Please select a question"
          options={Identity_Questions}
          variant={answerError ? 'error' : 'primary'}
          value={
            identityQuestion
              ? (Identity_Questions.find(q => q.value === identityQuestion) ?? null)
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
        {answerError && <span className="text-xs text-orange-300">{answerError}</span>}
      </div>
    </div>
  )
}

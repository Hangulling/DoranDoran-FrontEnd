import { useEffect, useState } from 'react'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import {
  isAtLeast14YearsOld,
  isPastDate,
  isValidCalendarDate,
  validateBirthDate,
} from '../../../utils/validations'
import { useOutletContext } from 'react-router-dom'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
}

export default function SignupBirthDate() {
  const { birthDate, setMany } = useSignupFormStore()
  const [birthDateError, setBirthDateError] = useState<string | null>(null)
  const { setCanSubmit } = useOutletContext<OutletContext>()

  const birthDateDisplay = birthDate.replace(
    /^(\d{4})(\d{0,2})(\d{0,2})$/,
    (_, y, m, d) => [y, m, d].filter(Boolean).join('-')
  )

  const handleBirthDateChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    setMany({ birthDate: digits })

    if (birthDateError) setBirthDateError(null)
  }

  const handleBirthDateBlur = (v: string) => {
    setBirthDateError(validateBirthDate(v))
  }

  const isBirthDateValid =
    birthDate.length === 8 &&
    birthDateError === null &&
    isValidCalendarDate(birthDate) === null &&
    isPastDate(birthDate) === null &&
    isAtLeast14YearsOld(birthDate) === null

  useEffect(() => {
    setCanSubmit(isBirthDateValid)
  }, [isBirthDateValid, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
        <p>When is your birthday?</p>
      </FormIntro>

      <div>
        <Input
          type="text"
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          variant={birthDateError ? 'error' : 'primary'}
          inputMode="numeric"
          onChange={e => handleBirthDateChange(e.target.value)}
          onBlur={() => handleBirthDateBlur(birthDate)}
          clearable
          onClear={() => {
            setMany({ birthDate: '' })
            setBirthDateError(null)
          }}
          value={birthDateDisplay}
        />
        {birthDateError && (
          <span className="text-body text-xs text-system-red">
            {birthDateError}
          </span>
        )}
      </div>
    </div>
  )
}

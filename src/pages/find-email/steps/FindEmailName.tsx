import { useEffect, useState } from 'react'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { useOutletContext } from 'react-router-dom'
import { useFindEmailStore } from '../../../stores/useFindEmailStore'
import { validateName } from '../../../utils/validations'

type OutletContext = {
  setOnSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindEmailName() {
  const { firstName, lastName, setMany } = useFindEmailStore()
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const { setCanSubmit } = useOutletContext<OutletContext>()

  const handleFirstNameChange = (v: string) => {
    const noSpace = v.replace(/[^A-Za-z]/g, '')
    setMany({ firstName: noSpace })
    setFirstNameError(validateName(noSpace))
    if (firstNameError) setFirstNameError(validateName(noSpace))
  }

  const handleLastNameChange = (v: string) => {
    const noSpace = v.replace(/[^A-Za-z]/g, '')
    setMany({ lastName: noSpace })
    setLastNameError(validateName(noSpace))
    if (firstNameError) setLastNameError(validateName(noSpace))
  }

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    validateName(firstName) === null &&
    validateName(lastName) === null

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
        <p>What's your name?</p>
      </FormIntro>
      <div>
        <Input
          type="text"
          label="First name"
          variant={firstNameError ? 'error' : 'primary'}
          placeholder="Enter your first name (1-15 characters)"
          onChange={e => handleFirstNameChange(e.target.value)}
          onBlur={() => setFirstNameError(validateName(firstName))}
          value={firstName}
          clearable
          onClear={() => {
            setMany({ firstName: '' })
            setFirstNameError(null)
          }}
        />
        {firstNameError && (
          <span className="text-body text-xs text-system-red">
            {firstNameError}
          </span>
        )}
      </div>
      <div>
        <Input
          type="text"
          label="Last name"
          placeholder="Enter your last name (1-15 characters)"
          variant={lastNameError ? 'error' : 'primary'}
          onChange={e => handleLastNameChange(e.target.value)}
          onBlur={() => setLastNameError(validateName(lastName))}
          value={lastName}
          clearable
          onClear={() => {
            setMany({ lastName: '' })
            setLastNameError(null)
          }}
        />
        {lastNameError && (
          <span className="text-body text-xs text-system-red">
            {lastNameError}
          </span>
        )}
      </div>
    </div>
  )
}

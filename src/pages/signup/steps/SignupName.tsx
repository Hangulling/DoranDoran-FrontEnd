import { useEffect, useState } from 'react'
import Input from '../../../components/common/Input'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import { validateName } from '../../../utils/validations'
import FormIntro from '../../../components/common/FormIntro'
import { useOutletContext } from 'react-router-dom'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
}

export default function SignupName() {
  const firstName = useSignupFormStore(s => s.firstName)
  const lastName = useSignupFormStore(s => s.lastName)
  const setMany = useSignupFormStore(s => s.setMany)
  const { setCanSubmit } = useOutletContext<OutletContext>()
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)

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
        <span>What's your name?</span>
      </FormIntro>
      <div className="mb-8">
        <Input
          variant={firstNameError ? 'error' : 'primary'}
          label="First name"
          placeholder="Enter your first name (1-15 characters)"
          clearable
          value={firstName}
          onChange={e => handleFirstNameChange(e.target.value)}
          onBlur={() => setFirstNameError(validateName(firstName))}
          onClear={() => {
            setMany({ firstName: '' })
            setFirstNameError(null)
          }}
        />
        {firstNameError && (
          <p className="text-body text-xs text-system-red">{firstNameError}</p>
        )}
      </div>

      <Input
        variant={lastNameError ? 'error' : 'primary'}
        label="Last name"
        placeholder="Enter your last name (1-15 characters)"
        clearable
        value={lastName}
        onChange={e => handleLastNameChange(e.target.value)}
        onClear={() => {
          setMany({ lastName: '' })
          setLastNameError(null)
        }}
      />
      {lastNameError && (
        <p className="text-body text-xs text-system-red">{lastNameError}</p>
      )}
    </div>
  )
}

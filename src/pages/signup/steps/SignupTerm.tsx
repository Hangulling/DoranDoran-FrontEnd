import { useLocation, useOutletContext } from 'react-router-dom'
import Agreement from '../../../components/common/Agreement'
import FormIntro from '../../../components/common/FormIntro'
import { useAgreementStore } from '../../../stores/useAgreementStore'
import { useEffect } from 'react'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
}

export default function SignupTerm() {
  const agreements = useAgreementStore(s => s.value)
  const setManyAgreements = useAgreementStore(s => s.setMany)
  const { setCanSubmit } = useOutletContext<OutletContext>()
  const location = useLocation()
  const requiredAgreed =
    agreements.service && agreements.privacy && agreements.ageLimit

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.key])

  useEffect(() => {
    setCanSubmit(requiredAgreed)
  }, [requiredAgreed, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
        <div>
          Nice to meet you :{')'}
          <p>Please review the terms.</p>
        </div>
      </FormIntro>
      <div className="my-2">
        <Agreement value={agreements} onChange={setManyAgreements} />
      </div>
    </div>
  )
}

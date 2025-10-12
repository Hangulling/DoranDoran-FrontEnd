import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { useAgreementStore, type TermId } from '../stores/useAgreementStore'

export default function PolicyPage() {
  const { term } = useParams<{ term: TermId }>()
  const navigate = useNavigate()
  const setOne = useAgreementStore(s => s.setOne)

  const handleConfirm = () => {
    if (term) setOne(term, true)
    navigate('/signup', { replace: true, state: { fromPolicy: true } })
  }

  return (
    <div>
      <div>PolicyPage {term ? `(${term})` : null}</div>
      <div className="m-2">
        <Button
          onClick={handleConfirm}
          variant="primary"
          size="xl"
          className="bg-gray-800 my-4 w-full text-subtitle"
        >
          Confirm
        </Button>
      </div>
    </div>
  )
}

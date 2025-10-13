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
      <iframe
        src={
          term === 'privacy'
            ? 'https://melodic-weather-784.notion.site/ebd/28a9b5c9498980a284c6fda283dc6caf'
            : 'https://melodic-weather-784.notion.site/ebd/28a9b5c9498980b1aba3db76c15f6792'
        }
        className="w-[100vw] h-[calc(100vh-80px)] overflow-x-hidden scale-[1.0] origin-top bg-white"
        style={{
          border: 'none',
          transform: 'scale(1)',
          transformOrigin: '0 0',
        }}
      />

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

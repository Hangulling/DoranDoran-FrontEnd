import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/common/Button'
import { useAgreementStore, type TermId } from '../stores/useAgreementStore'

export default function PolicyPage() {
  const { id } = useParams<{ id: TermId }>()
  const navigate = useNavigate()
  const location = useLocation()
  const setOne = useAgreementStore(s => s.setOne)

  const handleConfirm = () => {
    if (id) setOne(id, true)
    navigate('/signup', { replace: true, state: { fromPolicy: true } })
  }

  const search = new URLSearchParams(location.search)
  const hideViaQuery = search.get('hideConfirm') === '1'
  const hideConfirm = Boolean(location.state?.hideConfirm || hideViaQuery)

  return (
    <div className="bg-white overflow-hidden">
      <iframe
        src={
          id === 'service'
            ? 'https://melodic-weather-784.notion.site/ebd/28a9b5c9498980a284c6fda283dc6caf'
            : 'https://melodic-weather-784.notion.site/ebd/28a9b5c9498980b1aba3db76c15f6792'
        }
        className="w-full min-h-svh border-none overflow-x-hidden"
        style={{ transform: 'scale(1)', transformOrigin: '0 0' }}
      />

      {!hideConfirm && (
        <div className="flex justify-center fixed md:absolute max-w-md inset-x-0 bottom-0 bg-white shadow-[0_-1px_2px_0_rgba(0,0,0,0.08)] px-4 py-3 z-10">
          <Button onClick={handleConfirm} variant="primary" size="xl" className="bg-gray-800">
            Confirm
          </Button>
        </div>
      )}
    </div>
  )
}

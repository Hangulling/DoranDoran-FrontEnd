import Button from '../common/Button'
import arrowActive from '../../assets/icon/arrowRight.svg'

export default function EmptyCard() {
  return (
    <div className="flex flex-col items-center justify-center py-10 mt-50">
      <p className="text-body text-sm text-gray-600">You haven't saved any phrase yet.</p>
      <p className="text-body text-sm text-gray-600 mb-6">Save new expressions from chats!</p>
      <div>
        <Button
          variant="text"
          className="border border-green-400 rounded-full px-4 py-2 text-green-400"
        >
          <span className="flex items-center gap-1 text-sm">
            Start chatting
            <img src={arrowActive} alt="" className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}

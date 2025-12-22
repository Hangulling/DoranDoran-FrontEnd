import CheckIcon from '../../assets/icon/CheckIcon'
import Button from '../common/Button'

interface StepItemProps {
  step: number
  status: 'done' | 'current' | 'pending'
}

export default function StepItem({ step, status }: StepItemProps) {
  const bgClass = {
    done: 'bg-green-100',
    current: 'bg-green-400 shadow-[0_4px_4px_0_rgba(96,195,193,0.14)]',
    pending: 'bg-white border border-gray-90',
  }[status]

  const isCurrent = status === 'current'
  const isDone = status === 'done'

  return (
    <Button className={`${bgClass} w-[30px] h-[30px] !rounded-full`}>
      {isDone ? (
        <CheckIcon className="text-white" />
      ) : (
        <span className={`text-sm text-title ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
          {step}
        </span>
      )}
    </Button>
  )
}

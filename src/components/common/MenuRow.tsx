import ArrowRightIcon from '../../assets/icon/ArrowRightIcon'
import Button from './Button'

interface MenuRowProps {
  label: string
  onClick?: () => void
}

export default function MenuRow({ label, onClick }: MenuRowProps) {
  return (
    <Button
      variant="text"
      size="xl"
      className="w-full max-w-app md:max-w-tablet lg:max-w-desktop px-4 flex !justify-between"
      onClick={onClick}
    >
      <span className="text-body text-sm text-gray-800">{label}</span>
      <ArrowRightIcon />
    </Button>
  )
}

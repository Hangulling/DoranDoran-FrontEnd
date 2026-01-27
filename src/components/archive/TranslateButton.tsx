import TranslateEngIcon from '../../assets/archive/TranslateEngIcon'
import TranslateKorIcon from '../../assets/archive/TranslateKorIcon'
import type { Lang } from '../../types/archive'
import Button from '../common/Button'

interface TranslateButtonProps {
  value: Lang
  onChange: (next: Lang) => void
}

export default function TranslateButton({
  value,
  onChange,
}: TranslateButtonProps) {
  const toggle = () => {
    const next: Lang = value === 'ENG' ? 'KOR' : 'ENG'
    onChange(next)
  }

  return (
    <Button
      onClick={toggle}
      className="border border-gray-80 !bg-gray-0 rounded-lg w-9 h-7"
    >
      {value === 'ENG' ? (
        <TranslateKorIcon className="text-primary-300" />
      ) : (
        <TranslateEngIcon className="text-gray-500" />
      )}
    </Button>
  )
}

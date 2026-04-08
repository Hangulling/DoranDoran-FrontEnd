import { useEffect, useMemo, useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'
import showToast from '../common/CommonToast'
import { ONBOARDING_STEPS } from '../../constants/onboardingData'
import { updateInterests } from '../../api'
import { useUserStore } from '../../stores/useUserStore'

interface InterestChipProps {
  label: string
  icon: string
}

interface InterestSectionProp {
  initialInterest: string[]
}

export default function InterestSection({
  initialInterest,
}: InterestSectionProp) {
  const [isOpen, setIsOpen] = useState(false)
  const [toggleSelected, setToggleSelected] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const { id } = useUserStore()

  useEffect(() => {
    setSelected(initialInterest)
    setToggleSelected(initialInterest)
  }, [initialInterest])

  const interestStep = useMemo(
    () => ONBOARDING_STEPS.find(step => step.id === 4),
    []
  )

  const options = interestStep?.options ?? []

  const toggle = (value: string) => {
    setToggleSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const selectedOptions = options.filter(opt => selected.includes(opt.value))

  const handleSave = async () => {
    try {
      await updateInterests(id, toggleSelected)
      setIsOpen(false)
      setSelected(toggleSelected)
      showToast({
        message: 'Your changes have been saved',
        iconType: 'checkRound',
        size: 'long',
      })
    } catch (error) {
      console.log(error)
      showToast({
        message: 'Failed to save changes',
        iconType: 'error',
        size: 'long',
      })
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mx-4 mt-2 mb-4">
        <div className="text-title text-base text-gray-800">My Interests</div>
        <Button variant="text" onClick={() => setIsOpen(true)}>
          Edit
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 px-4">
        {selectedOptions.map(opt => (
          <InterestChip
            key={opt.value}
            label={String(opt.label ?? '')}
            icon={opt.image ?? ''}
          />
        ))}
      </div>

      {isOpen && (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Select your interests"
          footer={
            <Button
              variant="primary"
              size="xl"
              className="w-full"
              onClick={handleSave}
            >
              Save
            </Button>
          }
        >
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[390px]">
            {options.map(opt => {
              const isSelected = toggleSelected.includes(opt.value)

              return (
                <Button
                  key={opt.value}
                  type="button"
                  variant="dropdown"
                  onClick={() => toggle(opt.value)}
                  className={`w-full rounded-xl border px-4 py-3 flex items-center gap-3 transition
                    ${
                      isSelected
                        ? 'bg-primary-10 border-primary-200'
                        : 'bg-white border-gray-100'
                    }`}
                >
                  {opt.image && (
                    <img
                      src={opt.image}
                      alt={String(opt.label ?? '')}
                      className="w-6 h-6"
                    />
                  )}

                  <div className="flex flex-col items-start text-left">
                    <span className="text-subtitle text-[14px]">
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span className="text-[12px] text-gray-400 mt-0.5">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

function InterestChip({ label, icon }: InterestChipProps) {
  return (
    <div className="flex items-center gap-1.5 border border-gray-100 rounded-full px-3 py-2 bg-gray-0">
      {icon && <img src={icon} alt={label} className="w-4 h-4" />}
      <span className="text-title text-sm text-gray-800">{label}</span>
    </div>
  )
}

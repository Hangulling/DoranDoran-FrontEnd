import { useMemo } from 'react'
import Button from './Button'
import { Link } from 'react-router-dom'
import CheckIcon from '../../assets/icon/CheckIcon'
import ArrowRightIcon from '../../assets/icon/ArrowRightIcon'

type TermId = 'service' | 'privacy' | 'ageLimit' | 'marketing'
export type AgreementValue = Record<TermId, boolean>

interface AgreementProps {
  value: AgreementValue
  onChange: (next: AgreementValue) => void
}

export default function Agreement({ value, onChange }: AgreementProps) {
  const allChecked = useMemo(
    () => value.service && value.privacy && value.ageLimit && value.marketing,
    [value.service, value.privacy, value.ageLimit, value.marketing]
  )
  const someChecked = useMemo(
    () => value.service || value.privacy || value.ageLimit || value.marketing,
    [value.service, value.privacy, value.ageLimit, value.marketing]
  )

  const toggleAll = () => {
    const next = {
      service: !allChecked,
      privacy: !allChecked,
      ageLimit: !allChecked,
      marketing: !allChecked,
    }
    onChange(next)
  }

  const toggleOne = (id: TermId) => {
    onChange({ ...value, [id]: !value[id] })
  }

  const terms = [
    { id: 'all', label: 'Agree to all', required: false },
    {
      id: 'service',
      label: '(Required) Agree to Terms of Service',
      required: true,
    },
    {
      id: 'privacy',
      label: '(Required) Agree to Personal Information Policy',
      required: true,
    },
    {
      id: 'ageLimit',
      label:
        "(Required) I confirm that I'm 14 or older and the information is correct",
      required: true,
    },
    {
      id: 'marketing',
      label: '(Optional) Agree to Marketing Communications',
      required: false,
    },
  ] as const

  return (
    <div className="flex flex-col gap-3 w-[335px] my-2">
      <button
        type="button"
        onClick={toggleAll}
        className="flex items-center border border-gray-100 rounded-xl w-[335px] h-[56px] mb-2"
        role="checkbox"
        aria-checked={allChecked ? 'true' : someChecked ? 'mixed' : 'false'}
      >
        <span
          className={`mx-3 flex justify-center items-center relative w-6 h-6 border ${allChecked ? 'bg-primary-300' : 'bg-white border-gray-100'} rounded-full`}
        >
          <CheckIcon className="text-white" />
        </span>
        <span className="text-sm text-subtitle text-gray-800">
          I agree to all terms and conditions.
        </span>
      </button>

      {terms.slice(1).map(t => {
        const id = t.id as TermId
        const isChecked = value[id]

        return (
          <div key={t.id} className="flex items-center gap-2 mx-3 my-2">
            <button
              type="button"
              onClick={() => toggleOne(id)}
              className="flex items-center gap-2"
              role="checkbox"
              aria-checked={isChecked}
            >
              <span className="w-5 h-5 flex items-center justify-center mt-[2px] shrink-0">
                <CheckIcon
                  className={isChecked ? 'text-primary-300' : 'text-gray-200'}
                />
              </span>

              <span className="ml-2 text-gray-800 text-sm text-subtitle text-left leading-snug break-words">
                {t.label}
              </span>
            </button>

            {(t.id === 'service' || t.id === 'privacy') && (
              <Link to={`/policy/${id}`}>
                <Button
                  type="button"
                  variant="text"
                  size="xs"
                  className="w-6 h-6 p-1"
                  aria-label={`${t.label} details`}
                >
                  <ArrowRightIcon className="text-gray-500" />
                </Button>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

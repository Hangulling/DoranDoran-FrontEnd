interface ToggleSwitchProps {
  checked: boolean
  onClick: () => void
}

export default function ToggleSwitch({ checked, onClick }: ToggleSwitchProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center relative rounded-full w-[50px] h-[31px] ${checked ? 'bg-primary-300' : 'bg-gray-100'} transition `}
      >
        <span
          className={`inline-block rounded-full w-[27px] h-[27px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}

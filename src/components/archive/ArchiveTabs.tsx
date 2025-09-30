import useArchiveStore from '../../stores/useArchiveStore'
import Button from '../common/Button'

type Room = 'Honey' | 'Coworker' | 'Senior' | 'Client'

interface ArchiveTabsProps {
  activeTab: Room
  onChange?: (tab: Room) => void
}

export default function ArchiveTabs({ activeTab, onChange }: ArchiveTabsProps) {
  const { selectionMode } = useArchiveStore()
  const tabs: Room[] = ['Honey', 'Coworker', 'Senior', 'Client']
  return (
    <div className="flex justify-center">
      <div className="flex justify-between w-[335px]">
        {tabs.map(tab => {
          const isActive = activeTab === tab
          const disabled = selectionMode && !isActive
          return (
            <Button
              key={tab}
              disabled={disabled}
              className={`my-4 ${isActive ? 'bg-green-400 text-white' : 'bg-transparent text-gray-600 border border-gray-100'}  ${disabled && '!text-gray-200'} `}
              variant="tab"
              size="archive"
              onClick={() => onChange?.(tab)}
            >
              {tab}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

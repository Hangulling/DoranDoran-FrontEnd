import useArchiveStore from '../../stores/useArchiveStore'
import type { Room } from '../../types/archive'
import Button from '../common/Button'

interface ArchiveTabsProps {
  activeTab: Room[]
  onChange: (tab: Room[]) => void
}

export default function ArchiveTabs({ activeTab, onChange }: ArchiveTabsProps) {
  const { selectionMode } = useArchiveStore()
  const tabs: Room[] = ['All', 'Friend', 'Honey', 'Coworker', 'Senior']
  const realTabs: Room[] = ['Friend', 'Honey', 'Coworker', 'Senior']

  const toggleTab = (tab: Room) => {
    if (tab === 'All') {
      onChange(['All'])
      return
    }

    const current = activeTab.includes('All') ? realTabs : activeTab

    const has = current.includes(tab)
    const next = has ? current.filter(t => t !== tab) : [...current, tab]

    onChange(next.length === realTabs.length ? ['All'] : next)
  }

  return (
    <div>
      <div className="relative ml-5 overflow-x-auto ">
        <div className="flex justify-between gap-4 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = activeTab.includes('All')
              ? tab === 'All' || realTabs.includes(tab)
              : activeTab.includes(tab)

            const disabled = selectionMode && !isActive
            return (
              <Button
                key={tab}
                disabled={disabled}
                className={`w-full max-w-app md:max-w-tablet lg:max-w-desktop my-4 rounded-md ${isActive ? 'border border-primary-80 bg-primary-10 text-primary-200 text-subtitle text-sm' : 'bg-gray-50 text-gray-400 text-body text-sm'}  ${disabled && '!text-gray-200'} `}
                variant="tab"
                size="archive"
                onClick={() => toggleTab(tab)}
              >
                {tab}
              </Button>
            )
          })}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-10
                        bg-gradient-to-r from-transparent to-white"
        />
      </div>
    </div>
  )
}

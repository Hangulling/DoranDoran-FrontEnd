import { useEffect, useMemo, useState } from 'react'
import ArchiveTabs from '../../components/archive/ArchiveTabs'
import ClosenessSelect from '../../components/archive/ClosenessSelect'
import SentenceCard from '../../components/archive/SentenceCard'
import { deleteManyBookmarks, getAllBookmarks } from '../../api/archive'
import { ROOM_TO_BOT, type Lang, type Room } from '../../types/archive'
import { toCloseness } from '../../constants/archiveData'
import TranslateButton from '../../components/archive/TranslateButton'
import useArchiveStore from '../../stores/useArchiveStore'
import Button from '../../components/common/Button'
import CommonModal from '../../components/common/CommonModal'
import showToast from '../../components/common/CommonToast'

export default function SentenceArchivePage() {
  const [lang, setLang] = useState<Lang>('KOR')
  const [openId, setOpenId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<Room[]>(['All'])
  const [deleteCount, setDeleteCount] = useState(0)
  const [openModal, setOpenModal] = useState(false)

  const {
    items,
    selectionMode,
    selectedIds,
    seedItems,
    toggleSelect,
    closenessFilter,
    setClosenessFilter,
    setContentType,
    setActiveRoom,
    exitSelectionMode,
  } = useArchiveStore()

  useEffect(() => {
    setContentType('sentences')
    setActiveRoom(['All'])
  }, [setContentType, setActiveRoom])

  useEffect(() => {
    const getSentencesBookmark = async () => {
      try {
        const res = await getAllBookmarks()
        seedItems(res)
      } catch (error) {
        console.log(error, 'error')
      }
    }
    getSentencesBookmark()
  }, [seedItems])

  useEffect(() => {
    setOpenId(null)
  }, [selectedTab])

  const handleChangeTab = (tab: Room[]) => {
    setSelectedTab(tab)
    setActiveRoom(tab)
  }

  const filteredByRoom = useMemo(() => {
    if (selectedTab.includes('All')) return items

    const selectedBotTypes = selectedTab
      .filter(t => t !== 'All')
      .map(t => ROOM_TO_BOT[t])

    return items.filter(b => selectedBotTypes.includes(b.botType))
  }, [items, selectedTab])

  const visibleSentenceItems = useMemo(() => {
    return filteredByRoom
      .filter(b => b.aiResponse?.description)
      .filter(b => {
        if (closenessFilter === 'all') return true
        const closeness = toCloseness(b.aiResponse?.intimacyLevel ?? '')
        return closeness === closenessFilter
      })
  }, [filteredByRoom, closenessFilter])

  const handleDelete = async () => {
    try {
      const ids = [...selectedIds]
      if (ids.length > 0) {
        await deleteManyBookmarks(ids)
      }

      const res = await getAllBookmarks()
      seedItems(res)

      setOpenModal(false)
      showToast({
        message: `Selected ${ids.length > 1 ? 'sentences' : 'sentence'} deleted.`,
        iconType: 'checkRound',
      })
      exitSelectionMode()
    } catch (error) {
      console.log(error, 'error')
    }
  }

  return (
    <div>
      <ArchiveTabs activeTab={selectedTab} onChange={handleChangeTab} />

      <div className="flex justify-between p-3">
        <ClosenessSelect
          value={closenessFilter}
          onChange={setClosenessFilter}
        />
        <TranslateButton value={lang} onChange={setLang} />
      </div>

      {selectionMode && (
        <div className="flex justify-center items-center">
          <Button
            variant="text"
            className={`min-w-md h-11 bg-white fixed bottom-0 ${
              selectedIds.size > 0 ? 'text-system-red' : 'text-system-red-02'
            } active:text-orange-600 hover:text-orange-600`}
            size="xl"
            onClick={() => {
              setDeleteCount(selectedIds.size)
              setOpenModal(true)
            }}
            disabled={selectedIds.size < 1}
          >
            Delete {selectedIds.size > 0 ? `${selectedIds.size}` : ''}
          </Button>
        </div>
      )}

      <div className="p-3">
        {visibleSentenceItems.map(b => {
          const closeness = toCloseness(b.aiResponse?.intimacyLevel ?? '')
          const description =
            lang === 'ENG'
              ? (b.aiResponse?.translation?.english ?? '')
              : (b.aiResponse?.description ?? '')

          const content = b.correctedContent ?? ''

          return (
            <SentenceCard
              key={b.id}
              id={b.id}
              selected={selectedIds.has(b.id)}
              selectionMode={selectionMode}
              onToggleSelect={toggleSelect}
              closeness={closeness}
              content={content}
              description={description}
              open={openId === b.id}
              onToggle={() => setOpenId(prev => (prev === b.id ? null : b.id))}
            />
          )
        })}
      </div>

      {openModal && (
        <CommonModal
          open
          title="Delete saved sentences"
          description={`Do you want to delete ${deleteCount} ${
            deleteCount > 1 ? 'sentences' : 'sentence'
          }?`}
          cancelText="Keep"
          confirmText="Delete"
          onCancel={() => setOpenModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

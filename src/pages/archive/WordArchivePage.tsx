import { useEffect, useMemo, useState } from 'react'
import ArchiveTabs from '../../components/archive/ArchiveTabs'
import ClosenessSelect from '../../components/archive/ClosenessSelect'
import TranslateButton from '../../components/archive/TranslateButton'
import WordCard from '../../components/archive/WordCard'
import EmptyCard from '../../components/archive/EmptyCard'
import { ROOM_TO_BOT, type Lang, type Room } from '../../types/archive'
import { deleteManyBookmarks, getAllBookmarks } from '../../api/archive'
import { toCloseness } from '../../constants/archiveData'
import Button from '../../components/common/Button'
import CommonModal from '../../components/common/CommonModal'
import useArchiveStore from '../../stores/useArchiveStore'
import showToast from '../../components/common/CommonToast'

export default function WordArchivePage() {
  const [lang, setLang] = useState<Lang>('KOR')
  const [openId, setOpenId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<Room[]>(['All'])

  const [isLoading, setIsLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)

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
    setContentType('words')
    setActiveRoom(['All'])
    setClosenessFilter('all')
  }, [setContentType, setActiveRoom, setClosenessFilter])

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true)
        const res = await getAllBookmarks()
        seedItems(res)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookmarks()
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
      .filter(r => r !== 'All')
      .map(r => ROOM_TO_BOT[r])

    return items.filter(b => selectedBotTypes.includes(b.botType))
  }, [items, selectedTab])

  const wordItems = useMemo(() => {
    return filteredByRoom.filter(
      b => (b.aiResponse?.vocabulary?.length ?? 0) > 0
    )
  }, [filteredByRoom])

  const visibleWordItems = useMemo(() => {
    return wordItems.filter(b => {
      if (closenessFilter === 'all') return true
      const closeness = toCloseness(b.aiResponse?.intimacyLevel ?? '')
      return closeness === closenessFilter
    })
  }, [wordItems, closenessFilter])

  if (isLoading) {
    return (
      <div>
        <ArchiveTabs activeTab={selectedTab} onChange={handleChangeTab} />
      </div>
    )
  }

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
        message: `Selected ${ids.length > 1 ? 'words' : 'word'} deleted.`,
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

      <div className="flex justify-between p-5">
        <ClosenessSelect
          value={closenessFilter}
          onChange={setClosenessFilter}
        />
        <TranslateButton value={lang} onChange={setLang} />
      </div>

      {visibleWordItems.length === 0 ? (
        <div className="mt-40">
          <EmptyCard savedType="Words" />
        </div>
      ) : (
        <div className="px-3">
          {visibleWordItems.map(b => {
            const vocab = b.aiResponse.vocabulary![0]
            const closeness = toCloseness(b.aiResponse?.intimacyLevel ?? '')
            const description =
              lang === 'ENG' ? vocab.explanation : vocab.korExplanation

            return (
              <WordCard
                key={b.id}
                id={b.id}
                selected={selectedIds.has(b.id)}
                selectionMode={selectionMode}
                onToggleSelect={toggleSelect}
                closeness={closeness}
                word={vocab.word}
                pronunciation={vocab.pronunciation}
                description={description}
                content={b.content}
                open={openId === b.id}
                onToggle={() =>
                  setOpenId(prev => (prev === b.id ? null : b.id))
                }
              />
            )
          })}
        </div>
      )}

      {selectionMode && (
        <div className="flex justify-center items-center">
          <Button
            variant="text"
            className={`w-full max-w-app md:max-w-tablet lg:max-w-desktop h-11 bg-white fixed bottom-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] pt-3 mb-6 ${
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

      {openModal && (
        <CommonModal
          open
          title="Delete saved word"
          description={`Do you want to delete ${deleteCount} ${
            deleteCount > 1 ? 'words' : 'word'
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

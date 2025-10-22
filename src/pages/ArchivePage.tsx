import ArchiveTabs from '../components/archive/ArchiveTabs'
import ExpressionCard from '../components/archive/ExpressionCard'
import CommonModal from '../components/common/CommonModal'
import EmptyCard from '../components/archive/EmptyCard'
import Button from '../components/common/Button'
import checkCircle from '../assets/icon/checkRound.svg'
import useArchiveStore from '../stores/useArchiveStore'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  BOT_TO_ROOM,
  ROOM_TO_BOT,
  type BookmarkResponse,
  type BotType,
  type Room,
} from '../types/archive'
import { deleteManyBookmarks, getBookmarksByBotType } from '../api/archive'

export default function ArchivePage() {
  const {
    items,
    activeRoom,
    setActiveRoom,
    selectionMode,
    selectedIds,
    seedItems,
    exitSelectionMode,
  } = useArchiveStore()

  const [openModal, setOpenModal] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [roomResolved, setRoomResolved] = useState(false)

  const [dataReady, setDataReady] = useState(false)

  const list = items.filter(i => BOT_TO_ROOM[i.botType] === activeRoom)

  const location = useLocation()
  const fromChat = (location.state as { from?: string } | null)?.from === 'chat'

  const { id } = useParams<{ id?: string }>()
  const idToRoom: Record<string, Room> = useMemo(
    () => ({ '1': 'Friend', '2': 'Honey', '3': 'Coworker', '4': 'Senior' }),
    []
  )

  useEffect(() => {
    setOpenId(null)
  }, [activeRoom])

  useEffect(() => {
    if (id && idToRoom[id]) {
      setActiveRoom(idToRoom[id])
      setRoomResolved(true)
    } else {
      setRoomResolved(true)
    }
  }, [id, idToRoom, setActiveRoom])

  useEffect(() => {
    if (!roomResolved) return

    setDataReady(false)

    const fetchByRoom = async () => {
      try {
        const botType: BotType = ROOM_TO_BOT[activeRoom]
        const res = await getBookmarksByBotType(botType)
        seedItems(res ?? [])
        setError(null)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('★ 북마크 조회 실패:', msg)
        setError('조회 중 인증 오류(401) 또는 게이트웨이 정책 이슈')
      } finally {
        setDataReady(true)
      }
    }
    fetchByRoom()
  }, [activeRoom, seedItems, roomResolved])

  const handleConfirmDelete = async () => {
    const ids = Array.from(selectedIds)
    try {
      setOpenModal(false)
      if (ids.length > 0) {
        await deleteManyBookmarks(ids)
      }
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      exitSelectionMode()

      setDataReady(false)
      const botType: BotType = ROOM_TO_BOT[activeRoom]
      const data: BookmarkResponse[] = await getBookmarksByBotType(botType)
      seedItems(data ?? [])
      setDataReady(true)
    } catch (error) {
      console.log(error)
      setError('삭제 중 오류 발생')
      setDataReady(true)
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {!fromChat && (
        <ArchiveTabs key={activeRoom} activeTab={activeRoom} onChange={setActiveRoom} />
      )}

      {error && (
        <div className="alert alert-error my-2">
          <span>{error}</span>
        </div>
      )}

      {dataReady &&
        (list.length > 0 ? (
          <div className="mt-5">
            {list.map(item => (
              <ExpressionCard
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId(prev => (prev === item.id ? null : item.id))}
              />
            ))}
          </div>
        ) : (
          <EmptyCard />
        ))}

      {selectionMode && (
        <div className="flex justify-center items-center">
          <Button
            variant="text"
            className={`min-w-md h-11 bg-white fixed bottom-0 ${
              selectedIds.size > 0 ? 'text-orange-300' : 'text-orange-100'
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

      {showToast && (
        <div className="toast toast-center w-[335px] mb-6">
          <div className="alert bg-[#0F1010] opacity-80">
            <img src={checkCircle} className="w-5 h-5" />
            <span className="text-subtitle text-sm text-white">Saved phrase is deleted</span>
          </div>
        </div>
      )}

      {openModal && (
        <CommonModal
          open
          title="Delete saved phrase"
          description={`Do you want to delete ${deleteCount} ${deleteCount > 1 ? 'phrases' : 'phrase'}?`}
          cancelText="Keep"
          confirmText="Delete"
          onCancel={() => setOpenModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

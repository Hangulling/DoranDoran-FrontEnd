import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ArchiveTabs from '../components/archive/ArchiveTabs'
import ExpressionCard from '../components/archive/ExpressionCard'
import CommonModal from '../components/common/CommonModal'
import EmptyCard from '../components/archive/EmptyCard'
import Button from '../components/common/Button'
import checkCircle from '../assets/icon/checkRound.svg'
import useArchiveStore from '../stores/useArchiveStore'
import { BOT_TO_ROOM, type BookmarkResponse, type BotType, type Room } from '../types/archive'
import { deleteManyBookmarks, getBookmarksByCursor } from '../api/archive'
import ReactGA from 'react-ga4'
import { useUserStore } from '../stores/useUserStore'

// GA 환경 변수
const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'
const IS_PROD = import.meta.env.PROD

const PAGE_SIZE = 15
const EDGE_NEAR = 16
const EDGE_RELEASE = 64
const SAFE_OFFSET = EDGE_RELEASE + 1

// 문자열 → 숫자 매핑(대소문자/공백 허용)
const mapIntimacyToNum = (s?: string | null) => {
  if (!s) return undefined
  const v = s.trim().toLowerCase()
  if (v === 'polite') return 1
  if (v === 'casual') return 2
  if (v === 'friendly') return 3
  return undefined
}

// 친밀도 안전 추출 헬퍼 (any 없이)
function readIntimacyLevel(item: unknown): string | undefined {
  if (typeof item !== 'object' || item === null) return undefined
  const obj = item as Record<string, unknown>

  const nested = obj['aiResponse']
  if (nested && typeof nested === 'object') {
    const lvl = (nested as Record<string, unknown>)['intimacyLevel']
    if (typeof lvl === 'string') return lvl
  }
  const flat = obj['intimacyLevel']
  if (typeof flat === 'string') return flat
  return undefined
}

// ====== 삭제 이벤트용 안전 접근 헬퍼 ======
type ContentType = 'bot_message' | 'word_explanation' | 'ment_explanation'

function readChatroomId(item: unknown): string | undefined {
  if (typeof item !== 'object' || item === null) return undefined
  const v = (item as Record<string, unknown>)['chatroomId']
  return typeof v === 'string' ? v : undefined
}

function readCreatedAt(item: unknown): string | undefined {
  if (typeof item !== 'object' || item === null) return undefined
  const v = (item as Record<string, unknown>)['createdAt']
  return typeof v === 'string' ? v : undefined
}

function readContentType(item: unknown): ContentType {
  if (typeof item !== 'object' || item === null) return 'bot_message'
  const obj = item as Record<string, unknown>
  const raw = obj['type'] ?? obj['contentType']
  if (raw === 'word_explanation') return 'word_explanation'
  if (raw === 'ment_explanation') return 'ment_explanation'
  return 'bot_message'
}

// "hh.mm" 형태 문자열(요구사항 그대로)로 경과시간 생성
function timeSavedHHDotMM(createdAt?: string): string | undefined {
  if (!createdAt) return undefined
  const ms = Date.now() - new Date(createdAt).getTime()
  if (!Number.isFinite(ms)) return undefined
  const totalMin = Math.max(0, Math.round(ms / 60000))
  const hh = Math.floor(totalMin / 60)
  const mm = totalMin % 60
  return `${hh}.${mm.toString().padStart(2, '0')}` // 예: "2.05"
}

type Page = {
  items: BookmarkResponse[]
  nextCursorFromServer: string | null
  isLastOnServer: boolean
}

export default function ArchivePage() {
  const userId = useUserStore(state => state.id)
  const { activeRoom, setActiveRoom, selectionMode, selectedIds, seedItems, exitSelectionMode } =
    useArchiveStore()

  const scrollElRef = useRef<HTMLElement | null>(null)
  const edgeLock = useRef<'none' | 'top' | 'bottom'>('none')
  const roomCursorRef = useRef<Record<Room, string | null>>({
    Friend: null,
    Honey: null,
    Coworker: null,
    Senior: null,
  })

  // 탭 클릭으로 전환되었는지 표시 (초기 진입과 구분)
  const pendingClickRoomRef = useRef<Room | null>(null)

  const prevRef = useRef<() => void>(() => {})
  const nextRef = useRef<() => void>(() => {})
  const suppressNextScrollRef = useRef(false)

  const [pages, setPages] = useState<Page[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [roomResolved, setRoomResolved] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const list = pages[pageIndex]?.items ?? []
  const location = useLocation()
  const fromChat = (location.state as { from?: string } | null)?.from === 'chat'
  const { id } = useParams<{ id?: string }>()

  const idToRoom: Record<string, Room> = useMemo(
    () => ({ '1': 'Friend', '2': 'Honey', '3': 'Coworker', '4': 'Senior' }),
    []
  )

  // 라우팅으로 들어온 경우 방 지정
  useEffect(() => {
    if (id && idToRoom[id]) setActiveRoom(idToRoom[id])
    setRoomResolved(true)
  }, [id, idToRoom, setActiveRoom])

  // GA: view_store (페이지 진입 1회)
  useEffect(() => {
    if (IS_PROD && GA_ENABLED && userId && roomResolved) {
      const entryPoint = fromChat ? 'chatroom_id' : 'chatroom_list'
      ReactGA.event('view_store', {
        user_id: userId,
        entry_point: entryPoint,
      })
    }
  }, [roomResolved, userId, fromChat])

  const fetchLastWindow15 = useCallback(async (room: Room): Promise<BookmarkResponse[]> => {
    let all: BookmarkResponse[] = []
    let cursor: string | undefined = undefined
    let last = false
    for (let hop = 0; hop < 10 && !last; hop++) {
      const raw = await getBookmarksByCursor(cursor, PAGE_SIZE * 3)
      const content: BookmarkResponse[] = raw?.content ?? []
      if (content.length === 0) {
        last = !!raw?.last
        break
      }
      all = all.concat(content)
      cursor = content[content.length - 1]?.id
      last = !!raw?.last
    }
    const filtered = all.filter(i => BOT_TO_ROOM[i.botType as BotType] === room)
    const start = Math.max(0, filtered.length - PAGE_SIZE)
    return filtered.slice(start)
  }, [])

  const fetchPageFill15 = useCallback(
    async (room: Room, startFromCursor: string | null): Promise<Page> => {
      let acc: BookmarkResponse[] = []
      let nextCursor: string | null = startFromCursor ?? null
      let isLast = false
      const CHUNK = PAGE_SIZE * 3
      for (let hop = 0; hop < 5 && acc.length < PAGE_SIZE && !isLast; hop++) {
        const raw = await getBookmarksByCursor(nextCursor ?? undefined, CHUNK)
        const content: BookmarkResponse[] = raw?.content ?? []
        const filtered = content.filter(i => BOT_TO_ROOM[i.botType as BotType] === room)
        acc = acc.concat(filtered)
        const lastRaw = content[content.length - 1]
        nextCursor = lastRaw ? lastRaw.id : nextCursor
        isLast = !!raw?.last
        if (content.length === 0 && raw?.last) break
      }
      if (isLast && acc.length < PAGE_SIZE) acc = await fetchLastWindow15(room)
      const items = acc.slice(0, PAGE_SIZE)
      return { items, nextCursorFromServer: nextCursor, isLastOnServer: isLast }
    },
    [fetchLastWindow15]
  )

  // 탭 클릭 시: 플래l그만 설정 (GA 전송은 로드 완료 후)
  const handleTabChange = useCallback(
    (tab: Room) => {
      pendingClickRoomRef.current = tab
      setActiveRoom(tab)
    },
    [setActiveRoom]
  )

  const loadFirstPage = useCallback(async () => {
    try {
      setLoading(true)
      setDataReady(false)
      const firstPage = await fetchPageFill15(activeRoom, null)
      roomCursorRef.current[activeRoom] = firstPage.nextCursorFromServer

      setPages(firstPage.items.length ? [firstPage] : [])
      setPageIndex(0)
      setDataReady(true)
      seedItems(firstPage.items)

      if (
        IS_PROD &&
        GA_ENABLED &&
        userId &&
        pendingClickRoomRef.current === activeRoom &&
        firstPage.items.length > 0
      ) {
        const latest = firstPage.items[0]
        const strLevel = readIntimacyLevel(latest) ?? null

        ReactGA.event('click_home_store', {
          user_id: userId,
          concept: activeRoom.toLowerCase(),
          intimacy_level: mapIntimacyToNum(strLevel),
        })
      }
      pendingClickRoomRef.current = null

      requestAnimationFrame(() => {
        const el = scrollElRef.current
        if (el) {
          suppressNextScrollRef.current = true
          el.scrollTop = 0
        }
        edgeLock.current = 'none'
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('첫 페이지 로딩 실패:', msg)
      setError('조회 중 오류가 발생했습니다.')
      setDataReady(true)
    } finally {
      setLoading(false)
    }
  }, [activeRoom, fetchPageFill15, seedItems, userId])

  useEffect(() => {
    if (!roomResolved) return
    setPages([])
    setPageIndex(0)
    setError(null)
    edgeLock.current = 'none'
    roomCursorRef.current[activeRoom] = null
    void loadFirstPage()
  }, [activeRoom, roomResolved])

  const goNextPage = useCallback(async () => {
    if (loading) return
    if (pageIndex < pages.length - 1) {
      const nextIdx = pageIndex + 1
      setPageIndex(nextIdx)
      seedItems(pages[nextIdx].items)
      requestAnimationFrame(() => {
        const el = scrollElRef.current
        if (el) el.scrollTop = SAFE_OFFSET
        edgeLock.current = 'none'
      })
      return
    }

    const lastPage = pages[pages.length - 1]
    if (!lastPage) return
    try {
      setLoading(true)
      const currentRoom = activeRoom
      const page = await fetchPageFill15(currentRoom, roomCursorRef.current[currentRoom] ?? null)
      roomCursorRef.current[currentRoom] = page.nextCursorFromServer
      if (page.items.length === 0) return
      setPages(prev => [...prev, page])
      const nextIdx = pages.length
      setPageIndex(nextIdx)
      seedItems(page.items)
      requestAnimationFrame(() => {
        const el = scrollElRef.current
        if (el) el.scrollTop = SAFE_OFFSET
        edgeLock.current = 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [activeRoom, fetchPageFill15, loading, pageIndex, pages, seedItems])

  const goPrevPage = useCallback(() => {
    if (loading) return
    if (pageIndex <= 0) return
    const prevIdx = pageIndex - 1
    setPageIndex(prevIdx)
    seedItems(pages[prevIdx].items)
    requestAnimationFrame(() => {
      const el = scrollElRef.current
      if (el) el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight - SAFE_OFFSET)
      edgeLock.current = 'none'
    })
  }, [loading, pageIndex, pages, seedItems])

  useEffect(() => {
    prevRef.current = goPrevPage
    nextRef.current = goNextPage
  }, [goPrevPage, goNextPage])

  useEffect(() => {
    const el = document.getElementById('app-scroll') as HTMLElement | null
    if (!el) return
    scrollElRef.current = el

    const onScroll = () => {
      const node = scrollElRef.current
      if (!node || loading) return
      if (suppressNextScrollRef.current) {
        suppressNextScrollRef.current = false
        return
      }
      const { scrollTop, scrollHeight, clientHeight } = node
      const fromBottom = scrollHeight - clientHeight - scrollTop
      const nearTop = scrollTop <= EDGE_NEAR
      const nearBottom = fromBottom <= EDGE_NEAR
      const tallEnough = scrollHeight - clientHeight > EDGE_RELEASE * 2
      const awayFromEdges = scrollTop > EDGE_RELEASE && fromBottom > EDGE_RELEASE
      if (awayFromEdges && edgeLock.current !== 'none') edgeLock.current = 'none'
      if (nearTop && edgeLock.current !== 'top') {
        edgeLock.current = 'top'
        prevRef.current()
        return
      }
      if (tallEnough && nearBottom && edgeLock.current !== 'bottom') {
        edgeLock.current = 'bottom'
        nextRef.current()
        return
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [loading])

  const handleConfirmDelete = async () => {
    const ids = Array.from(selectedIds)
    try {
      setOpenModal(false)

      const itemsToDelete = pages.flatMap(p => p.items).filter(it => ids.includes(it.id))

      if (ids.length > 0) await deleteManyBookmarks(ids)

      if (IS_PROD && GA_ENABLED && userId) {
        itemsToDelete.forEach(item => {
          ReactGA.event('click_store_delete', {
            user_id: userId,
            chatroom_id: readChatroomId(item),
            content_type: readContentType(item),
            time_saved: timeSavedHHDotMM(readCreatedAt(item)),
          })
        })
      }

      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      exitSelectionMode()
      roomCursorRef.current[activeRoom] = null
      await loadFirstPage()
    } catch (error) {
      console.log(error)
      setError('삭제 중 오류 발생')
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {!fromChat && (
        <ArchiveTabs key={activeRoom} activeTab={activeRoom} onChange={handleTabChange} />
      )}

      {error && (
        <div className="alert alert-error my-2">
          <span>{error}</span>
        </div>
      )}

      {dataReady ? (
        list.length > 0 ? (
          <div className="mt-5 pb-6">
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
        )
      ) : null}

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
          description={`Do you want to delete ${deleteCount} ${
            deleteCount > 1 ? 'phrases' : 'phrase'
          }?`}
          cancelText="Keep"
          confirmText="Delete"
          onCancel={() => setOpenModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

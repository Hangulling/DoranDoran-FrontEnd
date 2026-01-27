import { create } from 'zustand'
import type { ArchiveType, BookmarkResponse, Room } from '../types/archive'
import { BOT_TO_ROOM } from '../types/archive'
import type { ClosenessFilter } from '../components/archive/ClosenessSelect'
import { toCloseness } from '../constants/archiveData'

interface ArchiveState {
  items: BookmarkResponse[]

  contentType: ArchiveType
  closenessFilter: ClosenessFilter

  selectedIds: Set<string>
  selectionMode: boolean
  deleteMode: boolean
  activeRoom: Room[]

  seedItems: (items: BookmarkResponse[]) => void
  appendItems: (items: BookmarkResponse[]) => void
  resetItems: () => void

  setContentType: (t: ArchiveType) => void
  setClosenessFilter: (f: ClosenessFilter) => void

  setActiveRoom: (room: Room[]) => void
  enterSelectionMode: () => void
  exitSelectionMode: () => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void

  deleteSelected: () => void
}

const isWordItem = (b: BookmarkResponse) =>
  (b.aiResponse?.vocabulary?.length ?? 0) > 0

const isSentenceItem = (b: BookmarkResponse) => !!b.aiResponse?.description

const getSelectableIds = (
  items: BookmarkResponse[],
  rooms: Room[],
  contentType: ArchiveType,
  closenessFilter: ClosenessFilter
) => {
  let base = items.filter(b =>
    contentType === 'words' ? isWordItem(b) : isSentenceItem(b)
  )

  if (!rooms.includes('All')) {
    const roomSet = new Set(rooms)
    base = base.filter(b => roomSet.has(BOT_TO_ROOM[b.botType]))
  }

  if (closenessFilter !== 'all') {
    base = base.filter(b => {
      const c = toCloseness(b.aiResponse?.intimacyLevel ?? '')
      return c === closenessFilter
    })
  }

  return base.map(b => b.id)
}

const useArchiveStore = create<ArchiveState>(set => ({
  items: [],

  contentType: 'words',
  closenessFilter: 'all',

  selectedIds: new Set(),
  selectionMode: false,
  activeRoom: ['All'],
  deleteMode: false,

  seedItems: items => set({ items }),

  appendItems: newItems =>
    set(state => {
      if (!newItems?.length) return {}
      const existing = new Set(state.items.map(i => i.id))
      const deduped = newItems.filter(i => !existing.has(i.id))
      if (deduped.length === 0) return {}
      return { items: [...state.items, ...deduped] }
    }),

  resetItems: () =>
    set({
      items: [],
      selectedIds: new Set(),
      selectionMode: false,
      deleteMode: false,
      activeRoom: ['All'],
      closenessFilter: 'all',
      contentType: 'words',
    }),

  setContentType: t =>
    set({
      contentType: t,
      selectedIds: new Set(),
      selectionMode: false,
      deleteMode: false,
    }),

  setClosenessFilter: f =>
    set({
      closenessFilter: f,
      selectedIds: new Set(),
      deleteMode: false,
    }),

  setActiveRoom: room =>
    set({
      activeRoom: room,
      selectedIds: new Set(),
      deleteMode: false,
    }),

  enterSelectionMode: () => set({ selectionMode: true }),

  exitSelectionMode: () =>
    set({ selectionMode: false, selectedIds: new Set(), deleteMode: false }),

  toggleSelect: (id: string) =>
    set(state => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      const idsInScope = getSelectableIds(
        state.items,
        state.activeRoom,
        state.contentType,
        state.closenessFilter
      )

      const allSelectedInScope =
        idsInScope.length > 0 && idsInScope.every(x => next.has(x))

      return { selectedIds: next, deleteMode: allSelectedInScope }
    }),

  selectAll: () =>
    set(state => {
      const idsInScope = getSelectableIds(
        state.items,
        state.activeRoom,
        state.contentType,
        state.closenessFilter
      )

      return {
        selectedIds: new Set(idsInScope),
        deleteMode: idsInScope.length > 0,
        selectionMode: true,
      }
    }),

  deselectAll: () =>
    set({
      selectedIds: new Set(),
      deleteMode: false,
    }),

  deleteSelected: () =>
    set(state => {
      const remain = state.items.filter(i => !state.selectedIds.has(i.id))
      return {
        items: remain,
        selectedIds: new Set(),
        selectionMode: false,
        deleteMode: false,
      }
    }),
}))

export default useArchiveStore

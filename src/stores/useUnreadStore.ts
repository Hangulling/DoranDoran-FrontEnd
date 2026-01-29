import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UnreadState {
  unreadMap: Record<string, boolean>
  setUnread: (chatroomId: string, hasUnread: boolean) => void
}

const useUnreadStore = create<UnreadState>()(
  persist(
    set => ({
      unreadMap: {},
      setUnread: (chatroomId, hasUnread) =>
        set(state => ({
          unreadMap: { ...state.unreadMap, [chatroomId]: hasUnread },
        })),
    }),
    {
      name: 'unread-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useUnreadStore

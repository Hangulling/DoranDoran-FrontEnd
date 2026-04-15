import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// 고정 키
export const DAILY_UNREAD_KEY = 'DAILY_GREETING'

interface UnreadData {
  hasUnread: boolean
  message?: string
  concept?: string
  chatbotId?: string
  topic?: string
}

interface UnreadState {
  unreadMap: Record<string, UnreadData>
  setUnread: (
    key: string,
    hasUnread: boolean,
    message?: string,
    concept?: string,
    chatbotId?: string,
    topic?: string
  ) => void
  clearAllUnread: () => void // 안읽음 상태 정리
}

const useUnreadStore = create<UnreadState>()(
  persist(
    set => ({
      unreadMap: {},
      setUnread: (key, hasUnread, message, concept, chatbotId, topic) =>
        set(state => ({
          unreadMap: {
            ...state.unreadMap,
            [key]: { hasUnread, message, concept, chatbotId, topic },
          },
        })),
      clearAllUnread: () => set({ unreadMap: {} }),
    }),
    {
      name: 'unread-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useUnreadStore

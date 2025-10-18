import { create } from 'zustand'

// 북마크 위한 사용자가 보낸 msgId, 내용
interface UserMsgState {
  userMsgId: string | null
  userContent: string | null
  setUserMsgId: (id: string | null) => void
  setUserContent: (content: string | null) => void
}

export const useUserMsgStore = create<UserMsgState>(set => ({
  userMsgId: null,
  userContent: null,
  setUserMsgId: id => set({ userMsgId: id }),
  setUserContent: content => set({ userContent: content }),
}))

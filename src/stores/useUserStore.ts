import { create } from 'zustand'

interface UserState {
  name: string
  setName: (name: string) => void
}

// 사용자 이름(풀네임) 저장
export const useUserStore = create<UserState>(set => ({
  name: '',
  setName: name => set({ name }),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  id: string
  name: string
  setId: (id: string) => void
  setName: (name: string) => void
}

// ID, 이름 저장
export const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: '',
      name: '',
      setId: id => set({ id }),
      setName: name => set({ name }),
    }),
    {
      name: 'user-storage',
    }
  )
)

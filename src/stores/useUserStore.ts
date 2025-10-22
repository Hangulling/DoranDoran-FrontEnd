import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  id: string
  name: string
  setId: (id: string) => void
  setName: (name: string) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: '',
      name: '',
      setId: id => set({ id }),
      setName: name => set({ name }),
      reset: () => {
        set({ id: '', name: '' })
        localStorage.removeItem('user-storage') // persist된 데이터 삭제
      },
    }),
    {
      name: 'user-storage',
    }
  )
)

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  id: string
  name: string
  savedCount: number
  streakCount: number
  perfectCount: number
  setId: (id: string) => void
  setName: (name: string) => void
  setSavedCount: (count: number) => void
  setStreakCount: (count: number) => void
  setPerfectCount: (count: number) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: '',
      name: '',
      savedCount: 0,
      streakCount: 0,
      perfectCount: 0,
      setId: id => set({ id }),
      setName: name => set({ name }),
      setSavedCount: count => set({ savedCount: count }),
      setStreakCount: count => set({ streakCount: count }),
      setPerfectCount: count => set({ perfectCount: count }),
      reset: () => {
        set({
          id: '',
          name: '',
          savedCount: undefined,
          streakCount: undefined,
          perfectCount: undefined,
        })
        sessionStorage.removeItem('user-storage') // persist된 데이터 삭제
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

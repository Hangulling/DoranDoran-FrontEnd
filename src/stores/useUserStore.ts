import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  id: string
  name: string
  email: string
  savedCount: number | null
  streakCount: number | null
  perfectCount: number | null
  isOnboarded: boolean
  setId: (id: string) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setSavedCount: (count: number) => void
  setStreakCount: (count: number) => void
  setPerfectCount: (count: number) => void
  setIsOnboarded: (val: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: '',
      name: '',
      email: '',
      savedCount: null,
      streakCount: null,
      perfectCount: null,
      isOnboarded: false,
      setIsOnboarded: val => set({ isOnboarded: val }),
      setId: id => set({ id }),
      setName: name => set({ name }),
      setEmail: email => set({ email }),
      setSavedCount: count => set({ savedCount: count }),
      setStreakCount: count => set({ streakCount: count }),
      setPerfectCount: count => set({ perfectCount: count }),
      reset: () => {
        set({
          id: '',
          name: '',
          email: '',
          isOnboarded: false,
          savedCount: null,
          streakCount: null,
          perfectCount: null,
        })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        id: state.id,
        name: state.name,
        email: state.email,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
)

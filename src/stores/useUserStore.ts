import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  id: string
  name: string
  email: string
  isOnboard: boolean
  savedCount: number | null
  streakCount: number | null
  perfectCount: number | null
  isLoaded: boolean // 데이터 로드 완료 여부
  setId: (id: string) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setSavedCount: (count: number) => void
  setStreakCount: (count: number) => void
  setPerfectCount: (count: number) => void
  setIsOnboard: (isOnboard: boolean) => void
  setIsLoaded: (isLoaded: boolean) => void
  reset: () => void
  setUserData: (data: {
    profile: { id: string; name: string; email: string; isOnboard: boolean }
    bookmarkCount: number
    stats: { streakCount: number; perfectCount: number }
  }) => void
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
      isOnboard: false,
      isLoaded: false,
      setId: id => set({ id }),
      setName: name => set({ name }),
      setEmail: email => set({ email }),
      setSavedCount: count => set({ savedCount: count }),
      setStreakCount: count => set({ streakCount: count }),
      setPerfectCount: count => set({ perfectCount: count }),
      setIsOnboard: isOnboard => set({ isOnboard }),
      setIsLoaded: isLoaded => set({ isLoaded }),
      reset: () => {
        set({
          id: '',
          name: '',
          email: '',
          savedCount: undefined,
          streakCount: undefined,
          perfectCount: undefined,
          isOnboard: false,
          isLoaded: false,
        })
      },
      setUserData: ({ profile, bookmarkCount, stats }) =>
        set({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          isOnboard: profile.isOnboard,
          savedCount: bookmarkCount,
          streakCount: stats.streakCount,
          perfectCount: stats.perfectCount,
          isLoaded: true,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        id: state.id,
        name: state.name,
        email: state.email,
        isOnboard: state.isOnboard,
      }),
    }
  )
)

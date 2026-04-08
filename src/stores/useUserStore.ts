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
  isLoaded: boolean
  setId: (id: string) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setIsOnboard: (isOnboard: boolean) => void
  setIsLoaded: (isLoaded: boolean) => void
  setUserData: (data: {
    profile: { id: string; name: string; email: string; isOnboard: boolean }
    bookmarkCount: number
    stats: { streakCount: number; perfectCount: number }
  }) => void
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
      isOnboard: false,
      isLoaded: false,

      setId: id => set({ id }),
      setName: name => set({ name }),
      setEmail: email => set({ email }),
      setIsOnboard: isOnboard => set({ isOnboard }),
      setIsLoaded: isLoaded => set({ isLoaded }),

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

      reset: () => {
        set({
          id: '',
          name: '',
          email: '',
          savedCount: null,
          streakCount: null,
          perfectCount: null,
          isOnboard: false,
          isLoaded: false,
        })
      },
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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClosenessState {
  closenessMap: Record<string, number>
  setCloseness: (roomId: string, value: number) => void
  getCloseness: (roomId: string) => number | undefined
}

const useClosenessStore = create(
  persist<ClosenessState & { reset: () => void }>(
    (set, get) => ({
      closenessMap: {},
      setCloseness: (roomId, value) => {
        set(state => ({
          closenessMap: { ...state.closenessMap, [roomId]: value },
        }))
      },
      getCloseness: roomId => {
        return get().closenessMap[roomId]
      },
      reset: () => set({ closenessMap: {} }),
    }),
    {
      name: 'closeness-storage',
    }
  )
)

export default useClosenessStore

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ModalState {
  noShowAgain: boolean
  setNoShowAgain: (val: boolean) => void
}

export const useModalStore = create<ModalState & { reset: () => void }>()(
  persist(
    set => ({
      noShowAgain: false,
      setNoShowAgain: val => set({ noShowAgain: val }),
      reset: () => {
        set({ noShowAgain: false })
        sessionStorage.removeItem('modal-state')
      },
    }),
    { name: 'modal-state', storage: createJSONStorage(() => sessionStorage) }
  )
)

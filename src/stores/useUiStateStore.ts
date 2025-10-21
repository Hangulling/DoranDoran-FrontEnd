import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CoachMarkState {
  coachMarkSeen: boolean
  setCoachMarkSeen: (val: boolean) => void
}

interface ModalState {
  noShowAgain: boolean
  setNoShowAgain: (val: boolean) => void
}

export const useCoachStore = create<CoachMarkState & { reset: () => void }>()(
  persist(
    set => ({
      coachMarkSeen: false,
      setCoachMarkSeen: val => set({ coachMarkSeen: val }),
      reset: () => set({ coachMarkSeen: false }),
    }),
    { name: 'coachMark-state' }
  )
)

export const useModalStore = create<ModalState & { reset: () => void }>()(
  persist(
    set => ({
      noShowAgain: false,
      setNoShowAgain: val => set({ noShowAgain: val }),
      reset: () => set({ noShowAgain: false }),
    }),
    { name: 'modal-state' }
  )
)

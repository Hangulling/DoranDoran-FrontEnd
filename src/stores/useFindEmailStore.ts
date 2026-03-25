import { create } from 'zustand'

interface FindEmailState {
  firstName: string
  lastName: string
  identityQuestion: string
  answer: string
  setMany: (v: Partial<FindEmailState>) => void
  reset: () => void
}

const initialState = {
  firstName: '',
  lastName: '',
  identityQuestion: '',
  answer: '',
}

export const useFindEmailStore = create<FindEmailState>(set => ({
  ...initialState,

  setMany: v => set(v),

  reset: () => set(initialState),
}))

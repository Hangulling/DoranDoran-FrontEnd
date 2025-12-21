import { create } from 'zustand'

interface PasswordResetState {
  email: string
  password: string
  passwordCheck: string
  code: string
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  setPasswordCheck: (v: string) => void
  setCode: (v: string) => void
  reset: () => void
}

const initialState = {
  email: '',
  password: '',
  passwordCheck: '',
  code: '',
}

export const usePasswordResetStore = create<PasswordResetState>(set => ({
  ...initialState,
  setEmail: v => set({ email: v }),
  setPassword: v => set({ password: v }),
  setPasswordCheck: v => set({ passwordCheck: v }),
  setCode: v => set({ code: v }),
  reset: () => set(initialState),
}))

import { create } from 'zustand'

interface SignupFormState {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordCheck: string
  emailVerified: boolean
  verifiedEmail: string | null
  setMany: (p: Partial<SignupFormState>) => void
  reset: () => void
}

export const useSignupFormStore = create<SignupFormState>(set => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordCheck: '',
  emailVerified: false,
  verifiedEmail: null,
  setMany: p => set(s => ({ ...s, ...p })),
  reset: () =>
    set({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordCheck: '',
      emailVerified: false,
      verifiedEmail: null,
    }),
}))

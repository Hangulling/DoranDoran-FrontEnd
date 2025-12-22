import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SignupFormState {
  firstName: string
  lastName: string
  birthDate: string
  identityQuestion: string
  answer: string
  email: string
  password: string
  passwordCheck: string
  emailVerified: boolean
  verifiedEmail: string | null
  setMany: (p: Partial<SignupFormState>) => void
  reset: () => void
}

export const useSignupFormStore = create<SignupFormState>()(
  persist(
    set => ({
      firstName: '',
      lastName: '',
      birthDate: '',
      identityQuestion: '',
      answer: '',
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
          birthDate: '',
          identityQuestion: '',
          answer: '',
          email: '',
          password: '',
          passwordCheck: '',
          emailVerified: false,
          verifiedEmail: null,
        }),
    }),
    {
      name: 'signup-form',
      partialize: state => ({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        emailVerified: state.emailVerified,
        verifiedEmail: state.verifiedEmail,
      }),
    }
  )
)

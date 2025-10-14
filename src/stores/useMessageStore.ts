import { create } from 'zustand'

interface Message {
  id: string
  sender: string
  content: string
}

interface MessageStore {
  messages: Message[]
  connected: boolean
  error: string | null
  addMessage: (msg: Message) => void
  setConnected: (status: boolean) => void
  setError: (err: string | null) => void
  clearMessages: () => void
}

export const useMessageStore = create<MessageStore>(set => ({
  messages: [],
  connected: false,
  error: null,
  addMessage: msg => set(state => ({ messages: [...state.messages, msg] })),
  setConnected: status => set({ connected: status }),
  setError: err => set({ error: err }),
  clearMessages: () => set({ messages: [] }),
}))

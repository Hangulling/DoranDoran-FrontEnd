import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RoomIdState {
  roomsMap: Record<string, string>
  addRoomMapping: (numId: string, uuid: string) => void
  removeRoomMapping: (numId: string) => void
}

interface RoomIdState {
  roomsMap: Record<string, string>
  chatbotMap: Record<string, string>
  addRoomMapping: (numId: string, uuid: string) => void
  removeRoomMapping: (numId: string) => void
  setChatbotId: (numId: string, chatbotId: string) => void
  removeChatbotId: (numId: string) => void
}

const useRoomIdStore = create<RoomIdState>()(
  persist(
    set => ({
      roomsMap: {},
      chatbotMap: {},

      addRoomMapping: (numId, uuid) =>
        set(state => ({
          roomsMap: { ...state.roomsMap, [numId]: uuid },
        })),

      removeRoomMapping: numId =>
        set(state => {
          const copy = { ...state.roomsMap }
          delete copy[numId]
          return { roomsMap: copy }
        }),

      setChatbotId: (numId, chatbotId) =>
        set(state => ({
          chatbotMap: { ...state.chatbotMap, [numId]: chatbotId },
        })),

      removeChatbotId: numId =>
        set(state => {
          const copy = { ...state.chatbotMap }
          delete copy[numId]
          return { chatbotMap: copy }
        }),
    }),
    {
      name: 'room-id-storage', // localStorage key
    }
  )
)

export default useRoomIdStore

// 나갈 때 useRoomIdStore.getState().removeRoomMapping(id) 사용

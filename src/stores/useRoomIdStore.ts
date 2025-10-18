import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RoomIdState {
  roomsMap: Record<string, string>
  addRoomMapping: (numId: string, uuid: string) => void
  removeRoomMapping: (numId: string) => void
}

const useRoomIdStore = create<RoomIdState>()(
  persist(
    set => ({
      roomsMap: {},
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
    }),
    {
      name: 'room-id-storage', // localStorage key
    }
  )
)

export default useRoomIdStore

// 나갈 때 useRoomIdStore.getState().removeRoomMapping(id) 사용

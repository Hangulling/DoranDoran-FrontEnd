import { create } from 'zustand'

interface RoomIdState {
  roomsMap: Record<string, string> // 숫자ID -> UUID 매핑 저장소
  addRoomMapping: (numId: string, uuid: string) => void
}

const useRoomIdStore = create<RoomIdState>(set => ({
  roomsMap: {},
  addRoomMapping: (numId, uuid) =>
    set(state => ({
      roomsMap: { ...state.roomsMap, [numId]: uuid },
    })),
}))

export default useRoomIdStore

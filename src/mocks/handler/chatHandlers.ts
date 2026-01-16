import { http, HttpResponse } from 'msw'
import { MAIN_DATA } from '../../constants/mainData'

interface DetailedChatRoom {
  roomId: number
  roomName: string
  category: string
  botId: number
  intimacy: number
}

let detailedChatRooms: DetailedChatRoom[] = MAIN_DATA.map((room, index) => ({
  roomId: Number(room.roomRouteId),
  roomName: room.roomName,
  category: room.concept.toUpperCase(),
  botId: index + 1,
  intimacy: 1, // 확인 후 삭제
}))

const BODY = '/api/chat'

export const chatHandlers = [
  // 채팅방 목록 조회
  http.get(`${BODY}/list`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRooms = detailedChatRooms.slice(startIndex, endIndex)

    if (paginatedRooms.length === 0) {
      return HttpResponse.json({ message: 'NO_DATA' }, { status: 404 })
    }

    const responseData = paginatedRooms.map(room => ({
      roomName: room.roomName,
      chattingRoom: room.roomId,
      category: room.category,
    }))

    return HttpResponse.json(responseData)
  }),

  // 채팅방 생성
  http.post(`${BODY}/create`, async ({ request }) => {
    const newRoomInfo = (await request.json()) as {
      roomName: string
      category: string
      botId: number
      intimacy: number
    }

    if (
      detailedChatRooms.some(room => room.roomName === newRoomInfo.roomName)
    ) {
      return HttpResponse.json({ message: 'DUPLICATE_TITLE' }, { status: 409 })
    }

    const newId =
      detailedChatRooms.length > 0
        ? Math.max(...detailedChatRooms.map(r => r.roomId)) + 1
        : 1
    const newRoom: DetailedChatRoom = {
      roomId: newId,
      ...newRoomInfo,
    }

    detailedChatRooms.push(newRoom)

    return HttpResponse.json(
      {
        roomId: newRoom.roomId,
        roomName: newRoom.roomName,
        category: newRoom.category,
        botId: newRoom.botId,
        intimacy: newRoom.intimacy,
      },
      { status: 201 }
    )
  }),

  // 채팅방 삭제
  http.delete(`${BODY}/lid/:id`, ({ params }) => {
    const { roomId } = params
    const initialLength = detailedChatRooms.length
    detailedChatRooms = detailedChatRooms.filter(
      room => room.roomId !== Number(roomId)
    )

    if (initialLength === detailedChatRooms.length) {
      return HttpResponse.json({ message: 'ALREADY_DELETED' }, { status: 404 })
    }

    return HttpResponse.json({ message: '소프트 딜리트 완료' })
  }),
]

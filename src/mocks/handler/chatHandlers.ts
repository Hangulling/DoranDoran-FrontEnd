import { http, HttpResponse } from 'msw'
import { chatRooms as initialChatRooms } from '../db/chat'

interface DetailedChatRoom {
  id: number
  title: string
  category: string
  botType: string
  intimacy: number
  lastMessage: string
}

let detailedChatRooms: DetailedChatRoom[] = initialChatRooms.map((room, index) => ({
  id: room.id,
  title: room.title,
  lastMessage: room.message,
  category: ['SCHOOL', 'LOVER', 'COMPANY', 'CLIENT'][index % 4],
  botType: ['TYPE_A', 'TYPE_B', 'TYPE_C', 'TYPE_D'][index % 4],
  intimacy: room.intimacy,
}))

const coachMarks: { [key: number]: boolean } = {
  1: true,
  2: true,
  3: true,
  4: true,
}

export const chatHandlers = [
  // 채팅방 목록 조회
  http.get('{Body}/chat/list', ({ request }) => {
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
      nickname: room.title,
      chattingRoom: room.id,
      latestMessage: room.lastMessage,
      category: room.category,
    }))

    return HttpResponse.json(responseData)
  }),

  // 채팅방 생성
  http.post('/api/chat/create', async ({ request }) => {
    const newRoomInfo = (await request.json()) as {
      title: string
      category: string
      botType: string
      intimacy: number
    }

    if (detailedChatRooms.some(room => room.title === newRoomInfo.title)) {
      return HttpResponse.json({ message: 'DUPLICATE_TITLE' }, { status: 409 })
    }

    const newId =
      detailedChatRooms.length > 0 ? Math.max(...detailedChatRooms.map(r => r.id)) + 1 : 1
    const newRoom: DetailedChatRoom = {
      id: newId,
      ...newRoomInfo,
      lastMessage: '새로운 대화를 시작해보세요!',
    }

    detailedChatRooms.push(newRoom)
    coachMarks[newId] = true

    return HttpResponse.json(
      {
        id: newRoom.id,
        title: newRoom.title,
        category: newRoom.category,
        botType: newRoom.botType,
        intimacy: newRoom.intimacy,
      },
      { status: 201 }
    )
  }),

  // 채팅방 이름 수정
  http.patch('/api/chat/lid/:id', async ({ params, request }) => {
    const { id } = params
    const { title } = (await request.json()) as { title: string }
    const roomToUpdate = detailedChatRooms.find(room => room.id === Number(id))

    if (!roomToUpdate) {
      return HttpResponse.json({ message: 'NOT_FOUND' }, { status: 404 })
    }

    roomToUpdate.title = title

    return HttpResponse.json({ message: '제목 변경 완료' })
  }),

  // 채팅방 삭제
  http.delete('/api/chat/lid/:id', ({ params }) => {
    const { id } = params
    const initialLength = detailedChatRooms.length
    detailedChatRooms = detailedChatRooms.filter(room => room.id !== Number(id))

    if (initialLength === detailedChatRooms.length) {
      return HttpResponse.json({ message: 'ALREADY_DELETED' }, { status: 404 })
    }

    return HttpResponse.json({ message: '소프트 딜리트 완료' })
  }),

  // 코치마크 실행 여부 확인
  http.get('/api/chat/lid/:id/mark', ({ params }) => {
    const { id } = params
    const hasSeen = coachMarks[Number(id)] ?? true // default: true

    return HttpResponse.json({ coachMark: hasSeen })
  }),

  // 코치마크 실행 상태 변경
  http.post('/api/chat/lid/:id/mark', ({ params, request }) => {
    const { id } = params
    const url = new URL(request.url)
    const q = url.searchParams.get('q') === 'true'

    if (coachMarks[Number(id)] === undefined) {
      return HttpResponse.json({ message: 'NOT_FOUND' }, { status: 404 })
    }

    coachMarks[Number(id)] = q

    return HttpResponse.json({ message: '코치마크 실행 여부 변경' })
  }),
]

export interface ChatRoom {
  roomId: number
  roomName: string
  avatar: string
  message: string
  intimacy: number
}

export interface Message {
  id: number
  text: string
  isSender: boolean
  avatarUrl?: string
  variant?: 'basic' | 'second' | 'sender'
  showIcon?: boolean
  explanation?: {
    word: string
    pronunciation: string
    selectedTab: 'Kor' | 'Eng'
    descriptionByTab: {
      Kor: string
      Eng: string
    }
  }
}

// api --> 후수정

export interface ApiChatRoom {
  id: string
  userId: string
  chatbotId: string
  name: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateChatroomPayload {
  userId: string
  chatbotId: string
  name: string
}

export interface ChatroomListParams {
  userId?: string
  page?: number
  size?: number
}

export interface ApiMessage {
  id: string
  chatroomId: string
  senderId: string
  senderType: 'user' | 'ai'
  content: string
  contentType: string
  createdAt: string
}

export interface SendMessagePayload {
  content: string
  contentType: string
  senderType: 'user' | 'ai'
}

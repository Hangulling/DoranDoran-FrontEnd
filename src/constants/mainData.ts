import type { ChatRoomWithMessage } from '../types/main'
import friend from '../assets/main/friend.png'
import honey from '../assets/main/honey.png'
import senior from '../assets/main/senior.png'
import coworker from '../assets/main/coworker.png'
import manager from '../assets/main/manager.png'

export const MAIN_DATA: ChatRoomWithMessage[] = [
  {
    roomRouteId: 1,
    roomName: 'friend',
    concept: 'friend',
    avatar: friend,
  },
  {
    roomRouteId: 2,
    roomName: 'honey',
    concept: 'honey',
    avatar: honey,
  },
  {
    roomRouteId: 3,
    roomName: 'coworker',
    concept: 'coworker',
    avatar: coworker,
  },
  {
    roomRouteId: 4,
    roomName: 'senior',
    concept: 'senior',
    avatar: senior,
  },
]

export const MANAGER_ROOM: ChatRoomWithMessage = {
  roomRouteId: 9,
  roomName: 'service admin',
  concept: 'service admin',
  message: 'Do you need any help?',
  avatar: manager,
}

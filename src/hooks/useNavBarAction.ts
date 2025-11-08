import { useMatch, useNavigate } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useUserStore } from '../stores/useUserStore'
import useRoomIdStore from '../stores/useRoomIdStore'
import { GA_ENABLED, IS_PROD } from '../constants/env'

export function useNavBar(onToggleSidebar?: () => void) {
  const navigate = useNavigate()
  const userId = useUserStore(state => state.id)
  const roomsMap = useRoomIdStore(state => state.roomsMap)

  const chatMatch = useMatch('/chat/:id')
  const closenessMatch = useMatch('/closeness/:id')
  const archiveMatch = useMatch('/archive/:id')

  const isChatPage = Boolean(chatMatch)
  const currentId = chatMatch?.params.id ?? closenessMatch?.params.id ?? archiveMatch?.params.id
  const chatroomId = currentId ? roomsMap[currentId] : undefined

  // 뒤로가기
  const goBack = () => {
    if (IS_PROD && GA_ENABLED && isChatPage && chatroomId) {
      ReactGA.event('click_previous', {
        chatroom_id: chatroomId,
        user_id: userId,
        previous_button: 'in_app_arrow', // "앱 내부 화살표"로 기록
      })
    }
    navigate(-1)
  }

  // 북마크 바로가기
  const handleBookmarkClick = () => {
    if (!currentId) {
      navigate('/archive/1')
      return
    }
    if (chatMatch || closenessMatch) {
      navigate(`/archive/${currentId}`, { state: { from: 'chat' } })
    }
  }

  // GA 포함 핸들러
  const handleHamburgerClick = () => {
    if (IS_PROD && GA_ENABLED) {
      ReactGA.event('open_side_menu')
    }
    if (onToggleSidebar) {
      onToggleSidebar()
    }
  }

  return {
    goBack,
    handleBookmarkClick,
    handleHamburgerClick,
    isChatPage,
  }
}

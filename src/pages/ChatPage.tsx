import { useEffect, useState } from 'react'
import ChatBubble from '../components/chat/ChatBubble'
import ChatDate from '../components/chat/ChatDate'
import CoachMark from '../components/chat/CoachMark'
import ChatFooter from '../components/chat/ChatFooter'

const ChatPage = () => {
  const [showCoachMark, setShowCoachMark] = useState(true)

  // API 연동 위해 작성
  useEffect(() => {
    // const checkCoachMarkSeen = async () => {
    //   const hasSeen = await api.get('/user/coachMark'); // API 호출
    //   if (hasSeen) {
    //     setShowCoachMark(false);
    //   }
    // };
    // checkCoachMarkSeen();
  }, []) // 한 번만 실행

  const handleCloseCoachMark = () => {
    setShowCoachMark(false)

    // await api.post('/user/coachMark'); // 확인 시 API 전달
  }

  return (
    <div className=" mx-5">
      <ChatDate dateText="2025년 9월 25일" />

      <ChatBubble
        message="테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트"
        isSender={false}
      />
      <ChatBubble
        message="테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트"
        isSender={true}
      />
      {/* showCoachMark */}
      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <ChatFooter />
    </div>
  )
}
export default ChatPage

import ChatBubble from '../components/chat/ChatBubble'
import ChatDate from '../components/chat/ChatDate'
import DistanceSlider from '../components/chat/DistanceSlider'

const ChatPage = () => {
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
      <DistanceSlider />
    </div>
  )
}
export default ChatPage

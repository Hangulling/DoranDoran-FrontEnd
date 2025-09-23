interface ChatDateProps {
  dateText: string
}

const ChatDate: React.FC<ChatDateProps> = ({ dateText }) => (
  <div className="flex items-center my-10">
    <div className="flex-grow border-t border-gray-100"></div>
    <span className="mx-4 text-gray-500 text-body text-[14px]">{dateText}</span>
    <div className="flex-grow border-t border-gray-100"></div>
  </div>
)

export default ChatDate

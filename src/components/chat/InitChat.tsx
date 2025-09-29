import React, { useState } from 'react'
import ChatBubble from './ChatBubble'
import Selection from './Selection'

const InitChat: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (option: string) => {
    setSelected(option)
  }

  return (
    <div>
      <ChatBubble
        message="뭐라고 답변해야할지 고민될 땐, 아래의 추천 문구를 선택해봐!"
        isSender={false}
        variant="second"
      />
      {
        <Selection
          options={['우왕!! 너무 좋지!', '진짜? 고마워ㅠ!', '감사합니다']}
          onSelect={handleSelect}
          selectedOption={selected}
        />
      }
      <div className="mt-3">{selected && <ChatBubble message={selected} isSender={true} />}</div>
    </div>
  )
}

export default InitChat

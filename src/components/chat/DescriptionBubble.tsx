import React, { useState } from 'react'

interface DescriptionBubbleProps {
  word: string
  pronunciation: string
  initialTab?: string
  descriptionByTab: Record<string, string>
}

const bubbleSecondClass =
  'ml-10 bg-white border border-gray-100 rounded-lg px-[10px] py-[10px] max-w-[265px] mb-2'

const DescriptionBubble: React.FC<DescriptionBubbleProps> = ({
  word,
  pronunciation,
  initialTab = '한국어',
  descriptionByTab,
}) => {
  const [selectedTab, setSelectedTab] = useState(initialTab)
  const tabs = ['한국어', '영어']

  return (
    <div className={bubbleSecondClass}>
      <div className="flex items-center justify-between text-[12px] mb-1">
        <div className="flex items-center">
          <span className="text-title">{`‘${word}’`}</span>
          {pronunciation && <span className="ml-2 text-gray-400">[{pronunciation}]</span>}
        </div>
        <div className="flex p-0.5 bg-gray-80 rounded-[6px]">
          {tabs.map(tab => (
            <button
              key={tab}
              className={
                selectedTab === tab
                  ? 'px-1 py-0.5 rounded-[4px] bg-white text-gray-800 text-subtitle shadow-none'
                  : 'px-1 py-0.5 rounded-[4px] bg-gray-80 text-gray-300 text-subtitle shadow-none'
              }
              style={{ border: 'none' }}
              onClick={() => setSelectedTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[1px] bg-gray-80 w-full my-2" />
      <div className="text-[14px] text-gray-700">{descriptionByTab[selectedTab]}</div>
    </div>
  )
}

export default DescriptionBubble

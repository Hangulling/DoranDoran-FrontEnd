// 메시지
export const messages = [
  {
    id: 1,
    text: '종강은 언제야?',
    isSender: false,
    avatarUrl: '/public/chat/lover.svg',
    variant: 'basic' as const,
    showIcon: true,
    //설명
    explanation: {
      word: '종강',
      pronunciation: 'Pronunciation',
      selectedTab: '한국어',
      descriptionByTab: {
        한국어: '종강은 학기가 끝나는 단어를 뜻해요',
        영어: 'The semester is over',
      },
    },
  },
]

import SchoolAvatar from '/chat/school.svg'
import LoverAvatar from '/chat/lover.svg'
import CompanyAvatar from '/chat/company.svg'
import ClientAvatar from '/chat/client.svg'

// 채팅방
export const chatRooms = [
  { id: 1, label: 'Senior', avatar: SchoolAvatar, message: '족보 필요하면 연락해~!' },
  { id: 2, label: 'Honey', avatar: LoverAvatar, message: '자기 어디야?' },
  { id: 3, label: 'Coworker', avatar: CompanyAvatar, message: '수정 사항 완료 되었나요?' },
  { id: 4, label: 'Client', avatar: ClientAvatar, message: '내일 미팅 10시 괜찮으세요?' },
]

// 메시지
export const initialMessages = [
  {
    id: 1,
    text: '종강은 언제야?',
    isSender: false,
    avatarUrl: '/public/chat/lover.svg',
    variant: 'basic',
    showIcon: true,
    //설명
    explanation: {
      word: '종강',
      pronunciation: 'Pronunciation',
      selectedTab: 'Kor',
      descriptionByTab: {
        Kor: '종강은 학기가 끝나는 단어를 뜻해요',
        Eng: 'The semester is over',
      },
    },
  },
] as const

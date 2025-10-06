import SchoolAvatar from '/chat/school.svg'
import LoverAvatar from '/chat/lover.svg'
import CompanyAvatar from '/chat/company.svg'
import ClientAvatar from '/chat/client.svg'

// 채팅방
export const chatRooms = [
  { id: 1, title: 'Senior', avatar: SchoolAvatar, message: '족보 필요하면 연락해~!', intimacy: 1 },
  { id: 2, title: 'Honey', avatar: LoverAvatar, message: '자기 어디야?', intimacy: 1 },
  {
    id: 3,
    title: 'Coworker',
    avatar: CompanyAvatar,
    message: '수정 사항 완료 되었나요?',
    intimacy: 1,
  },
  {
    id: 4,
    title: 'Client',
    avatar: ClientAvatar,
    message: '내일 미팅 10시 괜찮으세요?',
    intimacy: 1,
  },
]

// 메시지
// export const initialMessages = [
//   {
//     id: 1,
//     text: '배고파~ 치맥 먹으러 갈래?',
//     isSender: false,
//     avatarUrl: '/public/chat/lover.svg',
//     variant: 'basic',
//     showIcon: true,
//     //설명
//     explanation: {
//       word: '치맥',
//       pronunciation: 'chi-maek',
//       selectedTab: 'Kor',
//       descriptionByTab: {
//         Kor: '맥주와 치킨을 같이 즐기는 어쩌구',
//         Eng: 'A Korean slang term for the popular pairing of fried chicken and beer (maekju).',
//       },
//     },
//   },
// ] as const

export interface Message {
  id: number
  text: string
  isSender: boolean
  avatarUrl?: string
  variant?: 'basic' | 'second' | 'sender'
  showIcon?: boolean
  explanation?: {
    word: string
    pronunciation: string
    selectedTab: 'Kor' | 'Eng'
    descriptionByTab: {
      Kor: string
      Eng: string
    }
  }
}

export interface ExpressionItem {
  id: string
  chatRoom: 'Friend' | 'Honey' | 'Coworker' | 'Client'
  text: string
  intimacy: number
  ttsUrl?: string
  savedAt?: string
}

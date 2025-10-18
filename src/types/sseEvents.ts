import type { Message } from '../types/chat'

export interface IntimacyAnalysisData {
  score: number
  details: string
}

export interface VocabularyExtractedData {
  words: string[]
}

export interface VocabularyTranslatedData {
  translations: Record<string, string>
}

export interface ConversationChunkData {
  messages: Message[]
}

export interface ConversationCompleteData {
  finalText: string
}

export interface AggregatedCompleteData {
  summary: string
}

export interface AiInfoData {
  version: string
  model: string
}

export interface AgentErrorData {
  message: string
  code: number
}

export interface ConversationErrorData {
  error: string
}

export interface EventDataMap {
  intimacy_analysis: IntimacyAnalysisData
  vocabulary_extracted: VocabularyExtractedData
  vocabulary_translated: VocabularyTranslatedData
  conversation_chunk: ConversationChunkData
  conversation_complete: ConversationCompleteData
  aggregated_complete: AggregatedCompleteData
  ai_info: AiInfoData
  agent_error: AgentErrorData
  conversation_error: ConversationErrorData
  message: unknown // 기본 메시지 이벤트
}

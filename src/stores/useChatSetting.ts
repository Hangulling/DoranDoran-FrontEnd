// src/stores/useChatSettingStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatSettingState {
  // 단어 설명 말풍선
  isVocabularyEnabled: boolean
  setVocabularyEnabled: (enabled: boolean) => void

  // 교정 말풍선
  isCorrectionEnabled: boolean
  setCorrectionEnabled: (enabled: boolean) => void

  // 한글 설명
  isTranslationEnabled: boolean
  setTranslationEnabled: (enabled: boolean) => void
}

export const useChatSettingStore = create(
  persist<ChatSettingState>(
    set => ({
      // 기본값 켜짐
      isVocabularyEnabled: true,
      setVocabularyEnabled: enabled => set({ isVocabularyEnabled: enabled }),

      isCorrectionEnabled: true,
      setCorrectionEnabled: enabled => set({ isCorrectionEnabled: enabled }),

      isTranslationEnabled: false,
      setTranslationEnabled: enabled => set({ isTranslationEnabled: enabled }),
    }),
    {
      name: 'chat-settings-storage',
    }
  )
)

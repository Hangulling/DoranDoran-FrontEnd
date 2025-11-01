const CHATBOT_ID_TO_VALUE_MAP: Record<string, string> = {
  '22222222-2222-2222-2222-222222222221': '1',
  '22222222-2222-2222-2222-222222222222': '2',
  '22222222-2222-2222-2222-222222222223': '3',
  '22222222-2222-2222-2222-222222222224': '4',
}

export const getChatbotValueById = (chatbotId: string): string | undefined => {
  return CHATBOT_ID_TO_VALUE_MAP[chatbotId]
}

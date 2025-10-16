import { chatApi } from './api'
import { BOOKMARK_ENDPOINTS } from './endpoints'

export async function getAllBookmarks() {
  const res = await chatApi.get(BOOKMARK_ENDPOINTS.LIST_ALL)
  return res.data
}

export async function getBookmarksByCursor(lastId?: string, size = 20) {
  const res = await chatApi.get(BOOKMARK_ENDPOINTS.LIST_CURSOR(lastId, size))
  return res.data
}

export async function getBookmarksByBotType(botType: 'friend' | 'honey' | 'coworker' | 'senior') {
  const res = await chatApi.get(BOOKMARK_ENDPOINTS.LIST_BY_BOT_TYPE(botType))
  return res.data
}

export async function deleteBookmark(bookmarkId: string) {
  await chatApi.delete(BOOKMARK_ENDPOINTS.DELETE_ONE(bookmarkId))
}

export async function deleteManyBookmarks(bookmarkIds: string[]) {
  await chatApi.delete(BOOKMARK_ENDPOINTS.DELETE_MANY, { data: bookmarkIds })
}

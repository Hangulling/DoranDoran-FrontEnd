import type { BookmarkRequest } from '../types/archive'
import api from './api'
import { BOOKMARK_ENDPOINTS } from './endpoints'

// 헤더에 USERID 붙여야 함
export async function createBookmark(
  data: BookmarkRequest,
  config?: { headers: Record<string, string> }
) {
  const res = await api.post(BOOKMARK_ENDPOINTS.CREATE, data, config)
  return res.data
}

export async function getAllBookmarks() {
  const res = await api.get(BOOKMARK_ENDPOINTS.LIST_ALL)
  return res.data
}

export async function getBookmarksByCursor(lastId?: string, size = 20) {
  const res = await api.get(BOOKMARK_ENDPOINTS.LIST_CURSOR(lastId, size))
  return res.data
}

export async function getBookmarksByBotType(botType: 'friend' | 'honey' | 'coworker' | 'senior') {
  const res = await api.get(BOOKMARK_ENDPOINTS.LIST_BY_BOT_TYPE(botType))
  return res.data
}

export async function deleteBookmark(bookmarkId: string) {
  await api.delete(BOOKMARK_ENDPOINTS.DELETE_ONE(bookmarkId))
}

export async function deleteManyBookmarks(bookmarkIds: string[]) {
  await api.delete(BOOKMARK_ENDPOINTS.DELETE_MANY, { data: bookmarkIds })
}

export async function countBookmarks(): Promise<number> {
  const res = await api.get<number>(BOOKMARK_ENDPOINTS.COUNT)
  return res.data
}

import type { HomePost } from '../types/home'
import api from './api'
import { HOME_ENDPOINTS } from './endpoints'

// 게시글 6개 조회
export const getHomePosts = async (): Promise<HomePost[]> => {
  const response = await api.get<HomePost[]>(HOME_ENDPOINTS.GET_POSTS)
  return response.data
}

// 게시글 상세 조회
export const getHomePostDetail = async (
  externalId: string
): Promise<HomePost> => {
  const response = await api.get<HomePost>(
    HOME_ENDPOINTS.GET_POST_DETAIL(externalId)
  )
  return response.data
}

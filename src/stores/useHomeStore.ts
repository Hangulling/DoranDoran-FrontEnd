import { create } from 'zustand'
import type { HomePost } from '../types/home'

interface HomeState {
  homePosts: HomePost[]
  setHomePosts: (posts: HomePost[]) => void
}

export const useHomeStore = create<HomeState>(set => ({
  homePosts: [],
  setHomePosts: posts => set({ homePosts: posts }),
}))

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser, getUserStats } from '../api'
import { countBookmarks } from '../api/archive'
import { tokenService } from '../api/tokenService'
import { SplashScreen } from '@capacitor/splash-screen'

export const useFetchUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUserData = useUserStore(state => state.setUserData)
  const setIsLoaded = useUserStore(state => state.setIsLoaded)
  const isLoaded = useUserStore(state => state.isLoaded)

  const access = tokenService.access
  const refresh = tokenService.refresh
  const hasToken = !!access || !!refresh

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['userProfile', access],
    queryFn: async () => {
      const userResponse = await getCurrentUser()
      const profile = userResponse.data

      const [bookmarkCount, stats] = await Promise.all([
        countBookmarks().catch(() => 0),
        getUserStats(profile.id).catch(() => ({
          streakCount: 0,
          perfectCount: 0,
        })),
      ])

      return { profile, bookmarkCount, stats }
    },
    enabled: hasToken,
    staleTime: 0,
    retry: 0,
  })

  useEffect(() => {
    if (!hasToken) {
      setIsLoaded(true)
      return
    }

    if (isLoading) {
      setIsLoaded(false)
      return
    }

    if (data) {
      setUserData(data)
    }
  }, [data, hasToken, isLoading, setUserData, setIsLoaded])

  // 로드 완료시 스플래시 숨김
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hide().catch(() => {
        // 웹 브라우저 환경 등에서 실행될 때 발생하는 에러 무시
      })
    }
  }, [isLoaded])

  useEffect(() => {
    if (isError) {
      console.error('사용자 정보 로드 실패:', error)
      tokenService.clearTokens()
      useUserStore.getState().reset()
      queryClient.clear()
      setIsLoaded(true)
      navigate('/login', { replace: true })
    }
  }, [isError, navigate, setIsLoaded, error, queryClient])

  return {
    userName: data?.profile.name || '',
    userId: data?.profile.id || '',
    userEmail: data?.profile.email || '',
    isOnboard: data?.profile.isOnboard || false,
  }
}

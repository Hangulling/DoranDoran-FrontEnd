import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser, getUserStats } from '../api'
import { countBookmarks } from '../api/archive'
import { setGAUserContext } from '../utils/ga'
import { tokenService } from '../api/tokenService'

export const useFetchUser = () => {
  const navigate = useNavigate()

  const setUserData = useUserStore(state => state.setUserData)
  const setIsLoaded = useUserStore(state => state.setIsLoaded)

  const hasToken = !!tokenService.access || !!tokenService.refresh

  // 데이터 fetching 및 캐싱
  const { data, isError, isLoading } = useQuery({
    queryKey: ['userProfile'],
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
    gcTime: 1000 * 60 * 30,
    retry: 1,
  })

  useEffect(() => {
    if (!hasToken) {
      setIsLoaded(true)
      return
    }

    // 데이터를 가져오는 중에는 로딩 상태 유지
    if (isLoading) {
      setIsLoaded(false)
      return
    }

    // 데이터 로드 성공 시 스토어 업데이트
    if (data) {
      const { profile, bookmarkCount, stats } = data
      setGAUserContext(profile.id, profile.email)

      // 한 번에 업데이트
      setUserData({
        profile,
        bookmarkCount,
        stats,
      })
    }
  }, [data, hasToken, isLoading, setUserData, setIsLoaded])

  // 에러 발생 시 처리
  useEffect(() => {
    if (isError) {
      console.error('사용자 정보 로드 실패')
      setIsLoaded(true)
      navigate('/error', { state: { from: '/main' } })
    }
  }, [isError, navigate, setIsLoaded])

  return {
    userName: data?.profile.name || '',
    userId: data?.profile.id || '',
    userEmail: data?.profile.email || '',
    isOnboard: data?.profile.isOnboard || false,
  }
}

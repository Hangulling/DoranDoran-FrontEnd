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
      // 사용자 정보 조회
      const userResponse = await getCurrentUser()
      const profile = userResponse.data

      // 병렬 조회
      const [bookmarkCount, stats] = await Promise.all([
        countBookmarks(),
        getUserStats(profile.id),
      ])

      return { profile, bookmarkCount, stats }
    },
    enabled: hasToken, // 토큰 있을 때만 호출
    staleTime: 0, // 매번 데이터 호출
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
  })

  useEffect(() => {
    if (!hasToken) {
      setIsLoaded(true)
      return
    }

    if (hasToken && isLoading) {
      setIsLoaded(false)
      return
    }

    // 데이터 오면 일괄 업데이트
    if (data) {
      const { profile, bookmarkCount, stats } = data
      setGAUserContext(profile.id, profile.email)
      setUserData({ profile, bookmarkCount, stats })
    }
  }, [data, hasToken, isLoading, setUserData, setIsLoaded])

  // 에러 처리
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

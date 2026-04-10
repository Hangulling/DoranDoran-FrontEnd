import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser, getUserStats } from '../api'
import { countBookmarks } from '../api/archive'
import { setGAUserContext } from '../utils/ga'
import { tokenService } from '../api/tokenService'
import type { AxiosError } from 'axios'

export const useFetchUser = () => {
  const navigate = useNavigate()

  const setStoreName = useUserStore(state => state.setName)
  const setStoreId = useUserStore(state => state.setId)
  const setStoreEmail = useUserStore(state => state.setEmail)
  const setSavedCount = useUserStore(state => state.setSavedCount)
  const setStreakCount = useUserStore(state => state.setStreakCount)
  const setPerfectCount = useUserStore(state => state.setPerfectCount)

  // 데이터 fetching 및 캐싱
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const userResponse = await getCurrentUser()
      const profile = userResponse.data

      const [bookmarkCount, stats] = await Promise.all([
        countBookmarks(),
        getUserStats(profile.id),
      ])

      return { profile, bookmarkCount, stats }
    },
    staleTime: 0, // 매번 데이터 호출
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
  })

  useEffect(() => {
    if (data) {
      const { profile, bookmarkCount, stats } = data
      setGAUserContext(profile.id, profile.email) // 내부 사용자 판별
      setStoreName(profile.name)
      setStoreId(profile.id)
      setStoreEmail(profile.email)
      setSavedCount(bookmarkCount)
      setStreakCount(stats.streakCount)
      setPerfectCount(stats.perfectCount)
    }
  }, [
    data,
    setStoreName,
    setStoreId,
    setStoreEmail,
    setSavedCount,
    setStreakCount,
    setPerfectCount,
  ])

  // 에러 처리
  useEffect(() => {
    // 재발급 중일 때는 에러 처리 유예
    if (isError && !isFetching) {
      const axiosError = error as AxiosError
      const status = axiosError?.response?.status

      if (!tokenService.access && !tokenService.refresh) {
        navigate('/login')
        return
      }

      // 재발급 실패 후 최종 에러일 때만 이동
      if (status !== 401) {
        console.error('사용자 정보 로드 실패:', axiosError)
        navigate('/error', { state: { from: '/' } })
      }
    }
  }, [isError, isFetching, error, navigate])

  return {
    userName: data?.profile.name || '',
    userId: data?.profile.id || '',
    userEmail: data?.profile.email || '',
  }
}

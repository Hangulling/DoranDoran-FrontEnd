import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser, getUserStats } from '../api'
import { countBookmarks } from '../api/archive'

export const useFetchUser = () => {
  const navigate = useNavigate()

  const setStoreName = useUserStore(state => state.setName)
  const setStoreId = useUserStore(state => state.setId)
  const setStoreEmail = useUserStore(state => state.setEmail)
  const setSavedCount = useUserStore(state => state.setSavedCount)
  const setStreakCount = useUserStore(state => state.setStreakCount)
  const setPerfectCount = useUserStore(state => state.setPerfectCount)

  // 데이터 fetching 및 캐싱
  const { data, isError } = useQuery({
    queryKey: ['userProfile'], // 쿼리 키
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
    staleTime: 1000 * 60 * 10, // 10분간 데이터를 상한 상태로 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
  })

  // 데이터가 로드되거나 캐시에서 가져왔을 때 스토어 업데이트
  useEffect(() => {
    if (data) {
      const { profile, bookmarkCount, stats } = data
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
    if (isError) {
      console.error('사용자 정보 로드 실패')
      navigate('/error', { state: { from: '/main' } })
    }
  }, [isError, navigate])

  return {
    userName: data?.profile.name || '',
    userId: data?.profile.id || '',
    userEmail: data?.profile.email || '',
  }
}

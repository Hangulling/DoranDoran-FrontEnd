import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser, getUserStats } from '../api'
import { countBookmarks } from '../api/archive'

export const useFetchUser = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  const setStoreName = useUserStore(state => state.setName)
  const setStoreId = useUserStore(state => state.setId)
  const setSavedCount = useUserStore(state => state.setSavedCount)
  const setStreakCount = useUserStore(state => state.setStreakCount)
  const setPerfectCount = useUserStore(state => state.setPerfectCount)

  useEffect(() => {
    async function fetchUser() {
      try {
        // 사용자 정보 조회
        const userResponse = await getCurrentUser()
        const profile = userResponse.data

        // ID 사용하여 정보 병렬 조회
        const [bookmarkCount, stats] = await Promise.all([
          countBookmarks(),
          getUserStats(profile.id),
        ])

        setUserName(profile.name)
        setStoreName(profile.name)
        setUserId(profile.id)
        setStoreId(profile.id)

        setSavedCount(bookmarkCount)
        setStreakCount(stats.streakCount)
        setPerfectCount(stats.perfectCount)
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err)
        navigate('/error', { state: { from: '/main' } })
      }
    }
    fetchUser()
  }, [
    setStoreName,
    setStoreId,
    setSavedCount,
    navigate,
    setStreakCount,
    setPerfectCount,
  ])

  return { userName, userId }
}

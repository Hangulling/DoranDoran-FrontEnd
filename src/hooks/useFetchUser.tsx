import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/useUserStore'
import { getCurrentUser } from '../api'
import { countBookmarks } from '../api/archive'

export const useFetchUser = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  const setStoreName = useUserStore(state => state.setName)
  const setStoreId = useUserStore(state => state.setId)
  const setSavedCount = useUserStore(state => state.setSavedCount)

  useEffect(() => {
    async function fetchUser() {
      try {
        const [userResponse, bookmarkCount] = await Promise.all([
          getCurrentUser(),
          countBookmarks(),
        ])

        const profile = userResponse.data
        setUserName(profile.name)
        setStoreName(profile.name)
        setUserId(profile.id)
        setStoreId(profile.id)
        setSavedCount(bookmarkCount)
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err)
        navigate('/error', { state: { from: '/main' } })
      }
    }
    fetchUser()
  }, [setStoreName, setStoreId, setSavedCount, navigate])

  return { userName, userId }
}

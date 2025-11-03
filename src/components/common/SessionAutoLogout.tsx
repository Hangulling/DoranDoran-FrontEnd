import { useEffect, useRef, useState } from 'react'
import CommonModal from './CommonModal'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../api'
import { useAuthCleanupStore } from '../../stores/useAuthCleanupStore'

export default function SessionAutoLogout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const openedRef = useRef(false)

  // 정리해야 할 작업
  const preLogoutTask = useAuthCleanupStore(state => state.preLogoutTask)
  const setPreLogoutTask = useAuthCleanupStore(state => state.setPreLogoutTask)

  const handleConfirm = async () => {
    if (preLogoutTask) {
      console.log('페이지별 정리 작업을 실행')
      try {
        await preLogoutTask()
      } catch (e) {
        console.error('정리 작업 실행 중 오류:', e)
      } finally {
        // 한 번 실행했으면, 작업을 스토어에서 제거
        setPreLogoutTask(null)
      }
    }

    try {
      await logout()
    } catch (e) {
      console.error('자동 로그아웃 중 오류:', e)
    } finally {
      setOpen(false)
      openedRef.current = false
      navigate('/login', { replace: true })
    }
  }

  useEffect(() => {
    const openModal = () => {
      if (localStorage.getItem('session:manualLogout') === '1') return
      if (openedRef.current) return
      console.log('세션 만료/비활성 감지됨')
      openedRef.current = true
      setOpen(true)
    }

    window.addEventListener('auth:expired', openModal)
    window.addEventListener('auth:inactive', openModal)

    return () => {
      window.removeEventListener('auth:expired', openModal)
      window.removeEventListener('auth:inactive', openModal)
    }
  }, [])

  return (
    <CommonModal
      variant="signup"
      open={open}
      title="You will be logged out shortly"
      description={`You have been automatically logged out due to 1 hour of inactivity.`}
      confirmText="Confirm"
      onConfirm={handleConfirm}
      onCancel={handleConfirm}
    />
  )
}

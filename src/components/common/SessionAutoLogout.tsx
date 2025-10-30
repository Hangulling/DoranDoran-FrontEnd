import { useEffect, useRef, useState } from 'react'
import CommonModal from './CommonModal'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../api'

export default function SessionAutoLogout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const openedRef = useRef(false)

  const handleConfirm = async () => {
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

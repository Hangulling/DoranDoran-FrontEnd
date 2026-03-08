import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModalStore } from '../../stores/useUiStateStore'
import { useAuthCleanupStore } from '../../stores/useAuthCleanupStore'
import { leaveChatroom, updateUser } from '../../api'
import { useUserMsgStore } from '../../stores/useUserMsgStore'
import { useBackButton } from '../useBackButton'
import { sendGAEvent } from '../../utils/ga'

interface UseChatExitProps {
  chatroomId: string | undefined
  userId: string
  routeId: string | undefined
  enableGuard?: boolean
}

export const useChatExit = ({
  chatroomId,
  userId,
  routeId,
  enableGuard = true,
}: UseChatExitProps) => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasLeftRef = useRef(false)

  const noShowAgain = useModalStore(state => state.noShowAgain)
  const setPreLogoutTask = useAuthCleanupStore(state => state.setPreLogoutTask)

  const performLeaveChatroom = useCallback(async () => {
    if (!chatroomId || !userId) return

    try {
      await leaveChatroom(chatroomId, userId)
      console.log('채팅방 나가기 성공')

      sessionStorage.removeItem(`initChat_${routeId}`)
      sessionStorage.removeItem(`viewed_chatroom_${chatroomId}`)
      useUserMsgStore.getState().clearUserMsgs()
    } catch (error) {
      console.error('채팅방 나가기 실패:', error)
    }
  }, [chatroomId, userId, routeId])

  const handleConfirmExit = useCallback(async () => {
    if (hasLeftRef.current) return
    hasLeftRef.current = true

    // GA_leave_chatroom
    if (userId) {
      sendGAEvent('leave_chatroom', {
        chatroom_id: chatroomId,
        leave_timestamp: Math.floor(Date.now() / 1000),
      })
    }

    // 다시 보지 않기 설정 저장
    if (noShowAgain) {
      updateUser(userId, { exitModalDoNotShowAgain: true }).catch(e =>
        console.error('사용자 설정 업데이트 실패:', e)
      )
    }

    await performLeaveChatroom()
    setIsModalOpen(false)
    navigate('/', { replace: true })
  }, [chatroomId, userId, noShowAgain, navigate, performLeaveChatroom])

  const handleCancelExit = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleGoBack = useCallback(() => {
    if (!enableGuard) {
      navigate(-1)
      return
    }

    if (noShowAgain) {
      handleConfirmExit()
    } else {
      setIsModalOpen(true)
    }
  }, [enableGuard, noShowAgain, handleConfirmExit, navigate])

  // 하드웨어 뒤로가기
  useBackButton([
    {
      priority: 20,
      condition: isModalOpen,
      callback: handleCancelExit,
    },
    {
      priority: 10,
      condition: !isModalOpen && enableGuard,
      callback: () => {
        if (noShowAgain) {
          handleConfirmExit()
        } else {
          setIsModalOpen(true)
        }
      },
    },
  ])

  // 자동 로그아웃 시 정리
  useEffect(() => {
    if (chatroomId && userId) {
      const cleanupTask = async () => {
        if (hasLeftRef.current) return
        hasLeftRef.current = true
        console.log('자동 로그아웃으로 인한 채팅방 나가기 실행')
        await performLeaveChatroom()
      }
      setPreLogoutTask(cleanupTask)
    } else {
      setPreLogoutTask(null)
    }
    return () => setPreLogoutTask(null)
  }, [chatroomId, userId, setPreLogoutTask, performLeaveChatroom])

  return {
    isModalOpen,
    handleConfirmExit,
    handleCancelExit,
    handleGoBack,
  }
}

import { useEffect, useState } from 'react'
import MenuRow from '../components/common/MenuRow'
import ProfileSummary from '../components/account/ProfileSummary'
import { getCurrentUser } from '../api/auth'
import Button from '../components/common/Button'
import InterestSection from '../components/account/InterestSection'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../components/common/BottomSheet'
import ToggleSwitch from '../components/common/ToggleSwitch'
import type { User } from '../types/user'
import {
  getNotificationSetting,
  getUserInterests,
  updateNotificationSetting,
} from '../api'
import { useUserStore } from '../stores/useUserStore'
import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

const items = [
  { label: 'Terms of Service', to: '/policy/service' },
  { label: 'Privacy Policy', to: '/policy/privacy' },
]

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAlert, setIsAlert] = useState<boolean>(false)
  const [openAlert, setOpenAlert] = useState<boolean>(false)
  const [interests, setInterests] = useState<string[]>([])
  const navigate = useNavigate()
  const { id } = useUserStore()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()

        setUser(res.data)
      } catch (e) {
        const status = axios.isAxiosError(e) ? (e.response?.status ?? 500) : 500

        navigate('/error', { replace: true, state: { errorCode: status } })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchInterests = async () => {
      if (!id) return
      try {
        const interestRes = await getUserInterests(id)
        const keys = (interestRes.topics ?? []).map(
          (t: { topicKey: string }) => t.topicKey
        )
        setInterests(keys)
      } catch (e) {
        console.log('getUserInterests error', e)
      }
    }

    fetchInterests()
  }, [id])

  useEffect(() => {
    const getNotification = async () => {
      if (!id) return
      try {
        const res = await getNotificationSetting(id)
        setIsAlert(res.pushEnabled)
      } catch (error) {
        console.log(error)
      }
    }
    getNotification()
  }, [id])

  // 알림 권한 요청
  const registerPush = async () => {
    if (!Capacitor.isNativePlatform()) return

    try {
      let permStatus = await PushNotifications.checkPermissions()

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
      }
    } catch (e) {
      console.error('Push registration failed in MyPage', e)
    }
  }

  const handleNotification = async () => {
    if (!user?.id) return

    try {
      const res = await updateNotificationSetting(user.id, isAlert)
      setIsAlert(res.pushEnabled)
      setOpenAlert(false)

      if (isAlert) {
        // 알림 켰을 때 권한 요청
        await registerPush()
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (loading) return <div />
  if (!user) return null

  return (
    <div>
      <div className="flex flex-col items-center">
        <ProfileSummary
          name={user.name}
          email={user.email}
          onClick={() => navigate('/mypage/profile')}
        />

        <div className="bg-gray-50 h-2 w-full my-4" />

        <InterestSection initialInterest={interests} />

        <div className="bg-gray-50 h-2 w-full my-4" />

        <MenuRow
          label="Notification Settings"
          onClick={() => setOpenAlert(true)}
        />

        {openAlert && (
          <BottomSheet
            title="Notification Settings"
            description="Get notified about new messages 
        and important updates"
            isOpen={openAlert}
            onClose={() => setOpenAlert(prev => !prev)}
            footer={
              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={handleNotification}
              >
                Save
              </Button>
            }
          >
            <div className="flex justify-center items-center py-6">
              <ToggleSwitch
                checked={isAlert}
                onClick={() => setIsAlert(prev => !prev)}
              />
            </div>
          </BottomSheet>
        )}

        <div className="bg-gray-50 h-2 w-full my-4" />

        {items.map(item => (
          <MenuRow
            key={item.label}
            label={item.label}
            onClick={() => navigate(item.to, { state: { hideConfirm: true } })}
          />
        ))}
      </div>
    </div>
  )
}

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

const items = [
  { label: 'Terms of Service', to: '/policy/service' },
  { label: 'Privacy Policy', to: '/policy/privacy' },
]

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAlert, setIsAlert] = useState<boolean>(false)
  const [openAlert, setOpenAlert] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return <div />
  if (error || !user) return <div>유저 정보를 불러올 수 없습니다.</div>

  return (
    <div className="flex flex-col items-center">
      <ProfileSummary
        name={user.name}
        email={user.email}
        onClick={() => navigate('/mypage/profile')}
      />

      <div className="bg-gray-50 h-2 w-full my-4" />

      <InterestSection />

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
              onClick={() => {
                setOpenAlert(false)
              }}
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
  )
}

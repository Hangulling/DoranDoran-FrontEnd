import { useEffect, useState } from 'react'
import MenuRow from '../components/common/MenuRow'
import { deleteUser, getCurrentUser, logout } from '../api'
import CommonModal from '../components/common/CommonModal'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/useUserStore'
import type { User } from '../types/user'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [openLogout, setOpenLogout] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const userId = useUserStore(state => state.id)

  const handleLogout = async () => {
    try {
      await logout()

      navigate('/login', { replace: true })
      setOpenLogout(false)
    } catch (e) {
      console.log(e, 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(userId)
      navigate('/login', { replace: true })
      setOpenDelete(false)
    } catch (error) {
      console.log(error, 'error')
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch (e) {
        console.log(e, 'error')
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
    <div className="flex flex-col justify-center items-center mt-2">
      <div className="w-[335px] mb-2 mt-3">
        <div className="text-title text-lg text-gray-800">{user.name}</div>
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
          <span>{user.email}</span>
          <span className="h-2.5 w-px bg-gray-300" />
          <span>{user.birthDate}</span>
        </div>
      </div>

      <div className="bg-gray-50 h-2 w-full my-4" />
      <div className="">
        <MenuRow label="Log out" onClick={() => setOpenLogout(true)} />
        <MenuRow label="Delete account" onClick={() => setOpenDelete(true)} />
      </div>
      {openLogout && (
        <CommonModal
          title="Log out"
          description="You can log in again anytime."
          open={openLogout}
          onCancel={() => setOpenLogout(false)}
          onConfirm={handleLogout}
          cancelText="Keep"
          confirmText="Log out"
        />
      )}
      {openDelete && (
        <CommonModal
          title="Delete Account"
          description={[
            'This action cannot be undone.',
            'Are you sure you want to continue?',
          ]}
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onConfirm={handleDelete}
          cancelText="Keep"
          confirmText="Delete"
        />
      )}
    </div>
  )
}

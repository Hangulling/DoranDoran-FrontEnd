import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHomePostDetail } from '../api/home'
import type { HomePost } from '../types/home'
import LoadingSpinner from '../components/common/LoadingSpinner'

const InstaPage = () => {
  const { externalId } = useParams<{ externalId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<HomePost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!externalId) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await getHomePostDetail(externalId)
        setPost(data)
      } catch (error) {
        console.error('Failed to load post detail:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [externalId])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!post) {
    navigate('/error')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-0">
      {/* 이미지 */}
      <div className="w-full">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-auto object-contain max-h-[469px]"
        />
      </div>

      <div className="px-5">
        {/* 설명 (Description) */}
        <div className="text-[14px] text-body leading-relaxed whitespace-pre-wrap">
          {post.description}
        </div>
      </div>
    </div>
  )
}

export default InstaPage

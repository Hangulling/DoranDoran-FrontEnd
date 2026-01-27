import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHomePostDetail } from '../api/home'
import Button from '../components/common/Button'
import instagram from '../assets/main/instagram.png'
import { useHomeStore } from '../stores/useHomeStore'
import type { HomePost } from '../types/home'
import LeftArrow from '../assets/icon/leftArrow.svg?react'

const ImageSkeleton = () => (
  <div className="h-[469px] w-full bg-primary-30 animate-pulse" />
)

const TextSkeleton = () => (
  <div className="space-y-1 w-full animate-pulse">
    <div className="h-[18px] w-full bg-primary-30 rounded-[4px]" />
    <div className="h-[18px] w-full bg-primary-30 rounded-[4px]" />
    <div className="h-[18px] w-[60%] bg-primary-30 rounded-[4px]" />
  </div>
)

const InstaPage = () => {
  const { externalId } = useParams<{ externalId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<HomePost | null>(null)
  const [loading, setLoading] = useState(true)

  const { homePosts } = useHomeStore()

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

  // footer
  const currentIndex = homePosts.findIndex(p => p.externalId === externalId)
  const totalCount = homePosts.length
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < totalCount - 1 && currentIndex !== -1

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/insta/${homePosts[currentIndex - 1].externalId}`)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      navigate(`/insta/${homePosts[currentIndex + 1].externalId}`)
    }
  }

  const handleVisitInstagram = () => {
    if (!post?.permalink) {
      console.warn('Permalink is not available')
      return
    }
    window.open(post.permalink, '_blank', 'noopener,noreferrer')
  }

  if (!post) {
    navigate('/error')
    return null
  }

  return (
    <div className="flex min-h-full flex-col bg-gray-0">
      {/* 이미지 */}
      <div className="w-full">
        {loading ? (
          <ImageSkeleton />
        ) : (
          <img
            src={post?.imageUrl}
            alt={post?.title}
            className="w-full h-auto object-contain max-h-[469px]"
          />
        )}
      </div>

      <div className="flex flex-col px-5 gap-y-4">
        {/* 설명 */}
        {loading ? (
          <TextSkeleton />
        ) : (
          <div className="text-[14px] text-body leading-relaxed whitespace-pre-wrap">
            {post?.description}
          </div>
        )}

        <Button variant="visit" size="visit" onClick={handleVisitInstagram}>
          <img
            src={instagram}
            alt="instagram"
            className="w-[18px] h-[18px] mr-[6px]"
          />
          Visit Instagram
        </Button>
      </div>

      {totalCount > 0 && (
        <footer className="max-w-app md:max-w-tablet lg:max-w-desktop fixed bottom-0 left-0 right-0 h-[50px] bg-gray-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] border-t border-gray-100 grid grid-cols-3 items-center px-5 py-[14px] mx-auto text-[14px]">
          <div className="flex justify-start">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="flex items-center gap-x-[2px] whitespace-nowrap"
            >
              <LeftArrow
                className={`w-5 h-5 ${!hasPrev ? 'text-gray-400' : 'text-gray-800'}`}
              />
              <span className={hasPrev ? 'text-gray-800' : 'text-gray-400'}>
                Previous Post
              </span>
            </button>
          </div>

          <div className="flex justify-center items-center">
            <span>{currentIndex + 1}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">{totalCount}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="flex items-center gap-x-[2px] whitespace-nowrap"
            >
              <span className={hasNext ? 'text-gray-800' : 'text-gray-400'}>
                Next Post
              </span>
              <LeftArrow
                className={`w-5 h-5 rotate-180 ${!hasNext ? 'text-gray-400' : 'text-gray-800'}`}
              />
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

export default InstaPage

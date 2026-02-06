import { useEffect, useState } from 'react'
import { getHomePosts } from '../../api/home'
import { useHomeStore } from '../../stores/useHomeStore'

interface InstaContentProps {
  onCardClick?: (externalId: string) => void
}

// 스켈레톤 카드
const SkeletonCard = () => (
  <div
    className="
				flex-shrink-0 
        relative
        h-[226px] w-[180px] 
        rounded-[12px] overflow-hidden
				bg-primary-30 animate-pulse
      "
  />
)

const InstaContent = ({ onCardClick }: InstaContentProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const { homePosts, setHomePosts } = useHomeStore()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getHomePosts()
        setHomePosts(data)
      } catch (error) {
        console.error('Failed to fetch home posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (homePosts.length === 0) {
      fetchPosts()
    } else {
      setIsLoading(false)
    }
  }, [setHomePosts, homePosts.length])

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="no-scrollbar flex w-full gap-x-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (homePosts.length === 0) return null

  return (
    <div className="w-full">
      <div className="no-scrollbar flex w-full gap-x-2 overflow-x-auto">
        {homePosts.map(post => (
          <button
            key={post.externalId}
            onClick={() => onCardClick && onCardClick(post.externalId)}
            className="
              flex-shrink-0 
              relative 
              h-[226px] w-[180px] 
              items-center justify-center 
              rounded-[12px] overflow-hidden
              transition-transform
            "
          >
            <div className="h-full w-full overflow-hidden">
              <img
                src={post.coverImageUrl || post.imageUrl || ''}
                alt={post.title || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default InstaContent

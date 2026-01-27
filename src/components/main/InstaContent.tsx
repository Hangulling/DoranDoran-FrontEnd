import { useEffect, useState } from 'react'
import { getHomePosts } from '../../api/home'
import type { HomePost } from '../../types/home'

interface InstaContentProps {
  onCardClick?: (externalId: string) => void
}

const InstaContent = ({ onCardClick }: InstaContentProps) => {
  const [posts, setPosts] = useState<HomePost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getHomePosts()
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch home posts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // 스켈레톤 카드 컴포넌트
  const SkeletonCard = () => (
    <div
      className="
        flex-shrink-0 
        relative 
        h-[152px] w-[180px] 
        rounded-[16px] overflow-hidden
        bg-gray-0 border border-gray-80
      "
    >
      {/* 이미지 스켈레톤 */}
      <div className="h-[90px] w-full bg-primary-30 animate-pulse" />

      {/* 텍스트 스켈레톤 */}
      <div className="flex-1 flex flex-col justify-center px-4 py-[10px] gap-1">
        <div className="h-[18px] w-full bg-primary-30 rounded animate-pulse" />
        <div className="h-[18px] w-3/4 bg-primary-30 rounded animate-pulse" />
      </div>
    </div>
  )

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="no-scrollbar flex w-full gap-x-2 overflow-x-auto px-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="w-full">
      <div className="no-scrollbar flex w-full gap-x-2 overflow-x-auto">
        {posts.map(post => (
          <button
            key={post.externalId}
            onClick={() => onCardClick && onCardClick(post.externalId)}
            className="
              flex-shrink-0 
              relative 
              h-[152px] w-[180px] 
              items-center justify-center 
              rounded-[16px] overflow-hidden
              bg-gray-0 border border-gray-80
              transition-transform
            "
          >
            {/* 이미지 */}
            <div className="h-[90px] w-full overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 타이틀 */}
            <div className="flex-1 flex flex-col justify-center px-4 py-[10px]">
              <span className="text-body text-[14px] truncate-2-lines text-start">
                {post.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default InstaContent

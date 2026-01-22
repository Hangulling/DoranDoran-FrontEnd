import { useEffect, useState } from 'react'
import { getHomePosts } from '../../api/home'
import type { HomePost } from '../../types/home'

interface InstaContentProps {
  onCardClick?: (externalId: string) => void
}

const InstaContent = ({ onCardClick }: InstaContentProps) => {
  const [posts, setPosts] = useState<HomePost[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getHomePosts()
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch home posts:', error)
      }
    }
    fetchPosts()
  }, [])

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

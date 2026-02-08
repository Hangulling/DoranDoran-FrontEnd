import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHomePostDetail } from '../api/home'
import Button from '../components/common/Button'
import instagram from '../assets/main/instagram.png'
import { useHomeStore } from '../stores/useHomeStore'
import type { HomePost } from '../types/home'
import LeftArrow from '../assets/icon/leftArrow.svg?react'
import { AnimatePresence, motion, wrap } from 'framer-motion'

const ImageSkeleton = () => (
  <div className="w-full aspect-[4/5] bg-primary-30 animate-pulse" />
)

const TextSkeleton = () => (
  <div className="space-y-1 w-full animate-pulse">
    <div className="h-[18px] w-full bg-primary-30 rounded-[4px]" />
    <div className="h-[18px] w-full bg-primary-30 rounded-[4px]" />
    <div className="h-[18px] w-[60%] bg-primary-30 rounded-[4px]" />
  </div>
)

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

const InstaPage = () => {
  const { externalId } = useParams<{ externalId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<HomePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [[page, direction], setPage] = useState([0, 0])

  const { homePosts } = useHomeStore()

  useEffect(() => {
    if (!externalId) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setPage([0, 0])
        const data = await getHomePostDetail(externalId)

        if (!data) {
          navigate('/error')
          return
        }
        setPost(data)
      } catch (error) {
        console.error('Failed to load post detail:', error)
        navigate('/error')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [externalId, navigate])

  const assets = post?.assets || []
  const imageIndex = assets.length > 0 ? wrap(0, assets.length, page) : 0

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

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

  if (loading) {
    return (
      <div className="flex min-h-full flex-col bg-gray-0 pb-[calc(50px_+_env(safe-area-inset-bottom))]">
        <ImageSkeleton />
        <div className="mt-4">
          <TextSkeleton />
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="flex min-h-full flex-col bg-gray-0 pb-[calc(80px_+_env(safe-area-inset-bottom))]">
      <div className="w-full mb-1.5">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-0">
          <AnimatePresence initial={false} custom={direction}>
            {assets.length > 0 ? (
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag={assets.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.x < -50 || velocity.x < -500) paginate(1)
                  else if (offset.x > 50 || velocity.x > 500) paginate(-1)
                }}
                className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {assets[imageIndex].type === 'VIDEO' ? (
                  <video
                    src={assets[imageIndex].url}
                    poster={
                      assets[imageIndex].thumbnailUrl ||
                      post.coverImageUrl ||
                      ''
                    }
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={assets[imageIndex].url}
                    referrerPolicy="no-referrer"
                    alt={`${post.title} ${imageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </motion.div>
            ) : (
              <img
                src={post.imageUrl || ''}
                referrerPolicy="no-referrer"
                alt={post.title || ''}
                className="w-full h-full object-contain"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 인디케이터 */}
      {!loading && assets.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-3">
          {assets.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                idx === imageIndex ? 'bg-[#6C51F0]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col px-5 gap-y-4 mt-1.5">
        <div className="text-[14px] text-body leading-relaxed whitespace-pre-wrap">
          {post.description}
        </div>

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
        <footer className="z-50 max-w-app md:max-w-tablet lg:max-w-desktop fixed bottom-0 left-0 right-0 bg-gray-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] border-t border-gray-100 grid grid-cols-3 items-center px-5 pt-[14px] pb-[calc(14px_+_env(safe-area-inset-bottom))] mx-auto text-[14px]">
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

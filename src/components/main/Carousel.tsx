import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wrap } from 'framer-motion'
import img1 from '../../assets/main/carousel1.png'
import img2 from '../../assets/main/carousel2.png'
import img3 from '../../assets/main/carousel3.png'

const IMAGES = [img1, img2, img3]

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
  }),
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

const Carousel = () => {
  const [[page, direction], setPage] = useState([0, 0])
  const [isPaused, setIsPaused] = useState(false)

  // 인덱스 순환
  const imageIndex = wrap(0, IMAGES.length, page)

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection])
  }, [])

  // 자동 슬라이드
  useEffect(() => {
    if (isPaused) return // 눌러서 일시정지

    const timer = setInterval(() => {
      paginate(1)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused, paginate]) // page가 바뀌거나 pause 상태가 바뀌면 타이머 재설정

  return (
    <div
      className="relative w-full overflow-hidden aspect-[375/230]"
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          src={IMAGES[imageIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', ease: 'easeInOut', duration: 0.5 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute w-full h-full top-0 left-0 object-cover cursor-grab active:cursor-grabbing"
          alt={`Banner ${imageIndex + 1}`}
        />
      </AnimatePresence>

      {/* 인디케이터 */}
      <div className="absolute bottom-[53px] right-4 z-10 bg-gray-0/40 w-[39px] h-[22px] rounded-full flex justify-center items-center">
        <span className="text-gray-0 text-[12px]">
          {imageIndex + 1} / {IMAGES.length}
        </span>
      </div>
    </div>
  )
}

export default Carousel

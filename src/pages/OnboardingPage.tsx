import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ONBOARDING_SLIDES } from '../constants/onboardingData'
import { slideVariants } from '../constants/landingData'
import { useSlider } from '../hooks/useSlider'
import ArrowLeft from '../assets/icon/leftArrow.svg?react'
import ArrowRight from '../assets/icon/arrowRight.svg?react'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { page, direction, paginate, handleDragEnd, handleScreenClick } = useSlider(
    ONBOARDING_SLIDES.length
  )

  const isLastPage = page === ONBOARDING_SLIDES.length - 1

  const handleSkip = () => {
    navigate('/', { replace: true })
  }

  const handleNextClick = () => {
    if (page < ONBOARDING_SLIDES.length - 1) {
      paginate(1)
    } else {
      handleSkip()
    }
  }

  return (
    <div
      className="flex flex-col h-[100dvh] bg-white relative overflow-hidden"
      onClick={handleScreenClick}
    >
      {/* Header */}
      <header className="shrink-0 relative flex items-center justify-center px-5 pt-[41px] pb-3 z-20">
        <div className="flex gap-2">
          {ONBOARDING_SLIDES.map((_, index) => (
            <div
              key={index}
              className={`h-[10px] w-[10px] rounded-full transition-all duration-300 ${
                index === page ? 'bg-green-500' : 'bg-gray-80'
              }`}
            />
          ))}
        </div>

        <button
          onClick={e => {
            e.stopPropagation()
            handleSkip()
          }}
          className="absolute right-5 text-gray-400 bg-gray-30 text-[16px] px-3 py-1 rounded-full"
        >
          Skip
        </button>
      </header>

      <div className="flex-1 relative w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col pt-3 z-10"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* 텍스트 */}
            <div className="text-center mb-4 px-5 shrink-0">
              <h2 className="text-[36px] font-extrabold text-green-500 tracking-[-2px] mb-1">
                {ONBOARDING_SLIDES[page].title}
              </h2>
              <p className="text-gray-600 text-[14px]">{ONBOARDING_SLIDES[page].desc}</p>
            </div>

            {/* 이미지 */}
            <div className="flex-1 w-full flex items-end justify-center overflow-hidden pb-4">
              <img
                src={ONBOARDING_SLIDES[page].image}
                alt="Onboarding Screen"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 화살표 */}
      <div className="absolute bottom-0 left-0 right-0 border-gray-200 border-t-[0.6px] px-5 py-3 flex justify-between items-center w-full z-30 bg-white">
        <button
          onClick={e => {
            e.stopPropagation()
            paginate(-1)
          }}
          disabled={page === 0}
          className="p-2 rounded-full transition-colors"
        >
          <div style={{ color: page === 0 ? '#c0c4c3' : '#282A2A' }}>
            <ArrowLeft />
          </div>
        </button>

        {isLastPage ? (
          <button
            onClick={e => {
              e.stopPropagation()
              handleSkip()
            }}
            className="bg-green-400 text-white px-3 py-1 rounded-full text-[16px] transition-transform"
          >
            Start
          </button>
        ) : (
          <button
            onClick={e => {
              e.stopPropagation()
              handleNextClick()
            }}
            className="p-2 rounded-full transition-colors"
          >
            <div style={{ color: '#282A2A' }}>
              <ArrowRight />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import Arrow1 from '../../assets/chat/arrow1.svg'
import Arrow2 from '../../assets/chat/arrow2.svg?react'
import Arrow3 from '../../assets/chat/arrow3.svg?react'
import Arrow4 from '../../assets/chat/arrow4.svg'
import Arrow5 from '../../assets/chat/arrow5.svg'
import ExampleChat from '../../assets/chat/exampleChat.svg'
import ExampleSelect from '../../assets/chat/exampleSelect.svg'
import CloseIcon from '../../assets/chat/close.svg?react'

const stepsData = [
  {
    // 1단계
    holeStyle: {
      bottom: '57px',
      left: '0px',
      right: '0px',
      height: '116px',
    },
    content: (
      <>
        <div className="absolute bottom-[234px] left-1/2 -translate-x-1/2 w-[239px] flex flex-col items-center text-center text-subtitle text-[16px]">
          {/* 단계 표시 */}
          <div className=" bg-green-400 text-white text-[12px] w-[39px] px-[10px] py-[1px] rounded-[10px] mb-[8px]">
            1/4
          </div>
          {/* 설명 */}
          <p>
            Set your <span className="text-green-300">closeness level</span>
          </p>
          <p>and learn the right expressions</p>
        </div>
        <img
          src={Arrow1}
          alt="첫번째 화살표"
          className="absolute bottom-[187px] left-1/2 -translate-x-1/2"
        />
      </>
    ),
  },
  {
    // 2단계
    holeStyle: {
      bottom: '0px',
      left: '0px',
      right: '0px',
      height: '57px',
    },
    content: (
      <>
        <img src={ExampleSelect} alt="고르기 예시" className="absolute top-[292px] left-[60px]" />

        <div
          style={{
            position: 'absolute',
            top: `${292 + 63.5}px`,
            bottom: '74px',
            left: '0',
            width: '100%',
          }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center"
            style={{ left: '113px' }} // 그룹 전체의 가로 위치
          >
            <Arrow2 className="flex-grow min-h-0" />

            <div className="w-[239px] flex flex-col my-[14px] items-center text-center text-subtitle text-[16px]">
              <div className="bg-green-400 text-white text-[12px] w-[39px] px-[10px] py-[1px] rounded-[10px] mb-[8px]">
                2/4
              </div>
              <p>
                <span className="text-green-300">Type</span> or
                <span className="text-green-300"> pick</span> a reply
              </p>
            </div>

            <Arrow3 className="flex-grow min-h-0" />
          </div>
        </div>
      </>
    ),
  },
  {
    // 3단계
    content: (
      <>
        <img src={ExampleChat} alt="채팅 예시" className="absolute top-[162px] left-[60px]" />
        <img src={Arrow4} alt="네번째 화살표" className="absolute top-[249px] left-[176px]" />
        <div className="absolute top-[382px] left-[48px] w-[239px] flex flex-col items-center text-center text-subtitle text-[16px]">
          <div className=" bg-green-400 text-white text-[12px] w-[39px] px-[10px] py-[1px] rounded-[10px] mb-[8px]">
            3/4
          </div>
          <p>
            <span className="text-gray-300">Save</span> this expression
          </p>
        </div>
      </>
    ),
  },
  {
    // 4단계
    holeStyle: {
      top: '5px',
      right: '10px',
      width: '50px',
      height: '50px',
      borderRadius: '100px',
    },
    content: (
      <>
        <div className="absolute top-[158.23px] right-[24px] w-[239px] flex flex-col items-center text-center text-subtitle text-[16px]">
          <div className=" bg-green-400 text-white text-[12px] w-[39px] px-[10px] py-[1px] rounded-[10px] mb-[8px]">
            4/4
          </div>
          <p>
            <span className="text-green-300">Check</span> your saved expressions.
          </p>
        </div>
        <img src={Arrow5} alt="다섯번째 화살표" className="absolute top-[68.33px] right-[35px]" />
      </>
    ),
  },
]

interface CoachMarkProps {
  show: boolean
  onClose: () => void
}

const CoachMark: React.FC<CoachMarkProps> = ({ show, onClose }) => {
  const [step, setStep] = useState(0)

  const handleNext = () => {
    // 다음 단계로 이동
    if (step < stepsData.length - 1) {
      setStep(step + 1)
    } else {
      // 코치마크 닫기
      onClose()
    }
  }

  if (!show) {
    return null
  }

  const currentStep = stepsData[step]

  return (
    <div className="fixed inset-0 z-50 cursor-pointer" onClick={handleNext}>
      <div className="relative mx-auto w-full max-w-md h-screen overflow-hidden pointer-events-none">
        {/* 투명 영역 */}
        <div
          style={currentStep.holeStyle}
          className="absolute transition-all duration-300 ease-in-out shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] pointer-events-none"
        />

        {/* 안내 UI */}
        <div className="absolute w-full h-full text-white pointer-events-none">
          {currentStep.content}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={e => {
            e.stopPropagation() // 배경 클릭(handleNext) 방지
            onClose()
          }}
          className="absolute top-[17px] left-[20px] pointer-events-auto"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}

export default CoachMark

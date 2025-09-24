import React from 'react'
import ArrowUp from '../../assets/coachArrowUp.svg'
import ArrowDown from '../../assets/coachArrowDown.svg'
import BookMark from '../../assets/coachBookMark.svg'

interface CoachMarkProps {
  show: boolean
  onClose: () => void
}

const CoachMark: React.FC<CoachMarkProps> = ({ show, onClose }) => {
  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* 투명 영역 */}
      <div
        style={{
          width: '100%',
          height: '116px',
          bottom: '91px',
          left: '0',
        }}
        className="absolute shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
      />

      {/* 안내 UI */}
      <div className="relative w-full h-full text-white text-center pointer-events-none">
        <img src={BookMark} alt="북마크" className="absolute top-[2px] right-[2px]" />
        <img
          src={ArrowUp}
          alt="위쪽을 가리키는 화살표"
          className="absolute top-[71px] right-[24px]"
        />

        <div className="absolute top-[127px] right-[57px] text-[16px]">
          <p>저장한 대화는</p>
          <p>
            <span className="text-green-300">보관함</span>에서 확인해요
          </p>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-[264px] text-[16px]">
          <p>거리감 레벨을 설정하고</p>
          <p>
            <span className="text-green-300">친밀도에 따른 다른 표현</span>을 알아보아요!
          </p>
        </div>

        <img
          src={ArrowDown}
          alt="아래쪽을 가리키는 화살표"
          className="absolute left-1/2 -translate-x-1/2 bottom-[219px]"
        />
      </div>
    </div>
  )
}

export default CoachMark

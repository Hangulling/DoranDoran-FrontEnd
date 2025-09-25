import { useState } from 'react'
import Slider from '@mui/material/Slider'

const marks = [
  { value: 1, label: 'Lv. 1' },
  { value: 2, label: 'Lv. 2' },
  { value: 3, label: 'Lv. 3' },
]

const DistanceSlider = () => {
  const [value, setValue] = useState(1)

  // 이는 thumb이 Lv.3 마크를 침범하지 않도록 2.99로 제한.
  const handleChange = (_: unknown, newValue: number | number[]) => {
    const clampedValue = Math.min(newValue as number, 2.99)
    setValue(clampedValue)
  }

  const handleChangeCommitted = (_: unknown, newValue: number | number[]) => {
    const rounded = Math.round(newValue as number)
    const clampedRounded = Math.min(rounded, 2.99)
    setValue(clampedRounded)
  }

  const activeMarkIndex = Math.round(value) - 1

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '58px',
        boxSizing: 'border-box',
      }}
    >
      <Slider
        value={value}
        min={1}
        max={3}
        step={0.01}
        marks={marks}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="off"
        sx={{
          flexGrow: 1, // 남은 공간을 채우도록 설정
          height: 18,
          color: '#FFB98A',

          // thumb (하트 아이콘)
          '& .MuiSlider-thumb': {
            width: 44,
            height: 44,
            background: 'url(/chat/heart.svg) center/cover no-repeat',
            zIndex: 10,
            border: 'none',
            boxShadow: 'none',
            transform:
              value > 2.9
                ? 'translateX(calc(-50% - 27px)) translateY(-50%)' // Lv.3 마크 앞에서 멈추도록 왼쪽으로 추가 이동
                : 'translateX(-50%) translateY(-50%)', // 기본 중앙 정렬
            '&:before, &:after': { display: 'none' },
            '&:hover, &.Mui-focusVisible, &.Mui-active': {
              boxShadow: 'none',
              width: 44,
              height: 44,
            },
          },

          // 활성화 트랙
          '& .MuiSlider-track': {
            border: 'none',
            background: 'linear-gradient(to right, #FFB98A 0%, #FF583E 60%, #E23A20 100%)',
            boxShadow:
              'inset -1px -1px 4px rgba(0,0,0,0.15), inset 3px 3px 12px rgba(255,255,255,0.4)',
            zIndex: 1,
          },

          // 비활성화 레일
          '& .MuiSlider-rail': {
            opacity: 1,
            backgroundColor: '#eaebeb',
          },

          '& .MuiSlider-mark': {
            backgroundColor: 'transparent',
            width: 36,
            height: 36,
            top: '50%',
            transform: 'translate(-55%, -55%)',

            // Lv. 1, Lv. 2에 해당하는 마크
            '&[data-index="0"], &[data-index="1"]': {
              backgroundColor: '#eaebeb',
              border: '1.6px dashed #c0c4c3',
              borderRadius: '50%',
            },

            // Lv. 3에 해당하는 마크
            '&[data-index="2"]': {
              width: '36px',
              height: '36px',
              borderRadius: '100%',
              border: '2px solid #fff',
              background: 'url(/chat/lover.svg) center/cover no-repeat',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
              zIndex: 5,
            },
          },

          // 레이블
          '& .MuiSlider-markLabel': {
            marginTop: '12px',
            color: '#A6ABAA',
            fontSize: '12px',
            fontWeight: 'normal',
            transform: 'translateX(-55%)',

            // 활성화된 마크 레이블에만 bold
            [`&[data-index="${activeMarkIndex}"]`]: {
              fontWeight: 'bold',
              color: '#282A2A',
            },
          },
        }}
      />
    </div>
  )
}

export default DistanceSlider

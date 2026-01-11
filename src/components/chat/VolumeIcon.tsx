import React from 'react'
import VolumeIcon from '../../assets/icon/volume.svg?react'

interface TTSIconProps {
  onPlay: () => void
  playing: boolean
}

const TTSIcon: React.FC<TTSIconProps> = ({ onPlay, playing }) => {
  return (
    <button
      onClick={onPlay}
      className="focus:outline-none"
      aria-label="음성 재생"
    >
      {playing ? (
        <VolumeIcon className="text-primary-300" />
      ) : (
        <VolumeIcon className="text-gray-700" />
      )}
    </button>
  )
}

export default TTSIcon

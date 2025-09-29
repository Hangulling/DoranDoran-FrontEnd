import React from 'react'
import FilledMark from '../../assets/icon/filledBookMark.svg?react'
import OutlineMark from '../../assets/icon/outlineBookMark.svg?react'

interface BookmarkIconProps {
  isBookmarked: boolean
  onToggle: () => void
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ isBookmarked, onToggle }) => {
  return (
    <button onClick={onToggle} className="focus:outline-none" aria-label="북마크">
      {isBookmarked ? <FilledMark /> : <OutlineMark />}
    </button>
  )
}

export default BookmarkIcon

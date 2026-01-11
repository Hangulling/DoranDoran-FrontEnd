import React from 'react'
import Bookmark from '../../assets/icon/bookmark.svg?react'

interface BookmarkIconProps {
  isBookmarked: boolean
  onToggle: () => void
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  isBookmarked,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="focus:outline-none"
      aria-label="북마크"
    >
      {isBookmarked ? (
        <Bookmark className="text-primary-300" />
      ) : (
        <Bookmark className="fill-gray-0 stroke-gray-700" />
      )}
    </button>
  )
}

export default BookmarkIcon

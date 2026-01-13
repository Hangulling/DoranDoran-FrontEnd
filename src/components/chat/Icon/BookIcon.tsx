import React from 'react'
import Book from '../../../assets/icon/book.svg?react'

interface BookIconProps {
  isActive: boolean
  onToggle?: () => void
}

const BookIcon: React.FC<BookIconProps> = ({ isActive, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="focus:outline-none"
      aria-label="단어 표시"
    >
      <Book className={isActive ? 'text-gray-700' : 'text-primary-300'} />
    </button>
  )
}

export default BookIcon

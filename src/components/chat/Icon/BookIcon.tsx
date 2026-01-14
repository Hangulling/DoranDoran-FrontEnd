import React from 'react'
import Book from '../../../assets/icon/book.svg?react'
import ActiveBook from '../../../assets/icon/activeBook.svg?react'

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
      {isActive ? <Book className="text-gray-700" /> : <ActiveBook />}
    </button>
  )
}

export default BookIcon

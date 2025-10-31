import EmptyBookmark from '../../assets/icon/emptyBookmark.svg?react'

export default function EmptyCard() {
  return (
    <div className="flex flex-col items-center justify-center py-10 mt-50">
      <EmptyBookmark />
      <p className="text-subtitle text-lg text-gray-800 my-2">Saved Expressions!</p>
      <p className="text-body text-sm text-gray-600">No saved expressions.</p>
      <p className="text-body text-sm text-gray-600 mb-6">Save useful expressions as you learn.</p>
    </div>
  )
}

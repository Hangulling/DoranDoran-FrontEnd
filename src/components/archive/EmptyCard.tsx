import BookmarkIcon from '../../assets/icon/BookmarkIcon'

interface EmptyCardProp {
  savedType?: string
}

export default function EmptyCard({ savedType }: EmptyCardProp) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-full">
      <BookmarkIcon
        className="w-[90px] h-[90px]"
        bgColor="#F3F1FD"
        fillColor="#FFFFFF"
      />
      <p className="text-subtitle text-lg text-gray-800 mb-2 mt-7">
        Save {savedType} :)
      </p>
      <p className="text-body text-sm text-gray-600">
        No saved {savedType} yet
      </p>
      <p className="text-body text-sm text-gray-600">
        Save the ones you like as you learn
      </p>
    </div>
  )
}

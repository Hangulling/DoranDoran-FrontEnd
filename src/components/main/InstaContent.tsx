interface CardItem {
  id: number
  title: string
}

const DUMMY_CARDS: CardItem[] = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
  { id: 3, title: 'Card 3' },
  { id: 4, title: 'Card 4' },
  { id: 5, title: 'Card 5' },
  { id: 6, title: 'Card 6' },
]

interface InstaContentProps {
  onCardClick?: (id: number) => void
}

const InstaContent = ({ onCardClick }: InstaContentProps) => {
  return (
    <div className="w-full">
      <div className="no-scrollbar flex w-full gap-x-2 overflow-x-auto">
        {DUMMY_CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.id)}
            className="
              flex-shrink-0 
              relative 
              h-[152px] w-[180px] 
              items-center justify-center 
              rounded-[16px] 
              bg-gray-0 border border-gray-80
              transition-transform
            "
          >
            {/* 컨텐츠 */}
            <span className="text-gray-500">{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default InstaContent

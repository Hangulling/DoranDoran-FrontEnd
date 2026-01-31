import { useNavigate } from 'react-router-dom'
import ArrowRightIcon from '../../assets/icon/ArrowRightIcon'
import BookmarkIcon from '../../assets/icon/BookmarkIcon'
import { archiveData } from '../../constants/archiveData'
import Button from '../common/Button'

export default function ArchiveEntryCard() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3 w-full px-6 max-w-app md:max-w-tablet lg:max-w-desktop">
      {archiveData.map(item => (
        <Button
          key={item.to ?? item.title}
          variant="text"
          className="w-full px-3 py-4 rounded-xl !bg-gray-50"
          onClick={() => item.to && navigate(item.to)}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <BookmarkIcon bgColor={item.bgColor} />

              <div>
                <div className="text-left text-base font-semibold text-gray-700">
                  {item.title}
                </div>
                <div className="text-left text-xs text-gray-400 whitespace-nowrap">
                  {item.description}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <ArrowRightIcon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}

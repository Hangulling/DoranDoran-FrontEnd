import { useEffect } from 'react'
import ReactGA from 'react-ga4'
import ArchiveLogoImg from '../../assets/archive/archive.svg'
import ArchiveEntryCard from '../../components/archive/ArchiveEntryCard'
import { GA_ENABLED, IS_PROD } from '../../constants/env'

export default function ArchivePage() {
  useEffect(() => {
    if (IS_PROD && GA_ENABLED) {
      ReactGA.event('store_enter')
    }
  }, [])

  return (
    <div className="min-h-full bg-gray-0 ">
      <div className="mx-auto w-full max-w-app md:max-w-tablet lg:max-w-desktop flex flex-col">
        <div className="flex justify-center py-[18px] bg-gray-0 text-title text-base text-gray-800">
          Saved
        </div>
        <img src={ArchiveLogoImg} />
        <div className="flex justify-center items-center mt-8">
          <ArchiveEntryCard />
        </div>
      </div>
    </div>
  )
}

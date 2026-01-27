import ArchiveLogoImg from '../../assets/archive/archive.svg'
import ArchiveEntryCard from '../../components/archive/ArchiveEntryCard'

export default function ArchivePage() {
  return (
    <div className="min-h-full bg-gray-0 flex flex-col">
      <div className="flex justify-center py-[18px] bg-gray-0 text-title text-base text-gray-800">
        Saved
      </div>
      <img src={ArchiveLogoImg} />
      <div className="flex justify-center mt-8">
        <ArchiveEntryCard />
      </div>
    </div>
  )
}

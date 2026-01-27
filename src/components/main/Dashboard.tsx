import { useUserStore } from '../../stores/useUserStore'

const Dashboard = () => {
  const savedCount = useUserStore(state => state.savedCount)
  const streakCount = useUserStore(state => state.streakCount)
  const perfectCount = useUserStore(state => state.perfectCount)

  const Skeleton = () => (
    <div
      className={`h-[22px] w-[94px] bg-primary-30 rounded-[4px] animate-pulse`}
    />
  )

  return (
    <div className="bg-gray-0 rounded-[8px] shadow-[0px_0px_8px_rgba(0,0,0,0.12)] flex justify-between items-center py-[10px] px-5 w-full h-[66px]">
      {/* 연속 접속 */}
      <div className="flex flex-col items-center cursor-pointer w-[94px]">
        <div className="flex items-center gap-1 text-gray-700 text-title text-[16px]">
          {streakCount === null ? <Skeleton /> : <span>{streakCount}-day</span>}
        </div>
        <span className="text-[#7D7D7D] text-[12px]">Day Streak</span>
      </div>

      <div className="w-[1px] h-[42px] bg-gray-50"></div>

      {/* 보관한 표현 */}
      <div className="flex flex-col items-center cursor-pointer w-[94px]">
        <div className="text-gray-700 text-title text-[16px]">
          {savedCount === null ? <Skeleton /> : <span>{savedCount}</span>}
        </div>
        <span className="text-[#7D7D7D] text-[12px]">My Saves</span>
      </div>

      <div className="w-[1px] h-[42px] bg-gray-50"></div>

      {/* 퍼펙트 수 */}
      <div className="flex flex-col items-center cursor-pointer w-[94px]">
        <div className="text-gray-700 text-title text-[16px]">
          {perfectCount === null ? <Skeleton /> : <span>{perfectCount}</span>}
        </div>
        <span className="text-[#7D7D7D] text-[12px]">Perfect Answers</span>
      </div>
    </div>
  )
}

export default Dashboard

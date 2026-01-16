interface DashboardProps {
  days?: number // 연속 접속
  savedCount?: number // 보관한 표현 개수
  perfectCount?: number // 퍼펙트 수
}

const Dashboard = ({ days = 1 }: DashboardProps) => {
  return (
    <div className="bg-gray-0 rounded-[8px] shadow-[0px_0px_8px_rgba(0,0,0,0.12)] flex justify-around items-center py-3 px-[33.5px] w-full h-[66px]">
      {/* 연속 접속 */}
      <div className="flex flex-col items-center cursor-pointer">
        <div className="flex items-center gap-1 text-gray-700 text-title text-[16px]">
          <span>{days}-day</span>
        </div>
        <span className="text-[#7D7D7D] text-[12px]">Day Streak</span>
      </div>

      <div className="w-[1px] h-[42px] bg-gray-50"></div>

      {/* 보관한 표현 */}
      <div className="flex flex-col items-center cursor-pointer">
        <span className="text-[#7D7D7D] text-[12px]">My Saves</span>
      </div>

      <div className="w-[1px] h-[42px] bg-gray-50"></div>

      {/* 퍼펙트 수 */}
      <div className="flex flex-col items-center cursor-pointer">
        <span className="text-[#7D7D7D] text-[12px]">Perfect Answers</span>
      </div>
    </div>
  )
}

export default Dashboard

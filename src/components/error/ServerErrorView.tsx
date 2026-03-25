import type { ErrorViewProps } from '../../types/common'
import Arrow from '../../assets/icon/leftArrow.svg?react'
import Button from '../common/Button'
import ServerError from '/public/serverError.svg'

const ServerErrorView = ({ onClickBack }: ErrorViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img src={ServerError} alt="Server Error" />
      <h2 className="text-[22px] text-title text-gray-400 mt-3 mb-4 text-center">
        Uh-oh!
        <br />
        Something went wrong.
      </h2>
      <p className="text-gray-300 text-[14px] mb-7.5 text-center leading-relaxed">
        Don’t worry, it’s not your fault.
        <br />
        We’re already looking into it,
        <br />
        so please check back later.
      </p>
      <div className="text-title text-gray-300 text-[14px] text-center mb-7.5">
        Error Code : <span className="text-body">500</span>
      </div>
      <Button variant="home" className="py-2 px-3" onClick={onClickBack}>
        <span className="flex items-center gap-x-1">
          <Arrow className="w-4 h-4" />
          Go Back
        </span>
      </Button>
    </div>
  )
}

export default ServerErrorView

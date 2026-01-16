interface CloseCircleIconProps {
  className?: string
}

export default function CloseCircleIcon({ className }: CloseCircleIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_808_38846)">
        <circle cx="10" cy="10" r="10" fill="#C4C3C6" />
        <path
          d="M13 7L7 13M7 7L13 13"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_808_38846">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

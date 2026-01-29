interface BookmarkIconProps {
  className?: string
  bgColor?: string
  fillColor?: string
}

export default function BookmarkIcon({
  className,
  bgColor = '#2C2A2C',
  fillColor = '#FFFFFF',
}: BookmarkIconProps) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="18" fill={bgColor} />
      <path
        d="M14.7596 9.90002H21.2396C21.8125 9.90002 22.3619 10.1134 22.767 10.4931C23.172 10.8729 23.3996 11.388 23.3996 11.925V26.1L17.9996 23.0625L12.5996 26.1V11.925C12.5996 11.388 12.8272 10.8729 13.2323 10.4931C13.6373 10.1134 14.1867 9.90002 14.7596 9.90002Z"
        fill={fillColor}
      />
    </svg>
  )
}

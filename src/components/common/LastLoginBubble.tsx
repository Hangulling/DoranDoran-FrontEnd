type Provider = 'google' | 'email'

interface LastLoginBubbleProps {
  provider: Provider
}

const positionMap: Record<Provider, string> = {
  google: 'absolute bottom-12 right-10',
  email: 'absolute  bottom-12 right-10',
}

export default function LastLoginBubble({ provider }: LastLoginBubbleProps) {
  return (
    <div className={`w-[83px]  ${positionMap[provider]}`}>
      <div className="relative bg-gray-900/90 text-center text-white text-xs px-2 py-1 rounded-[13px]">
        Last login
        <span
          className="absolute left-5 -translate-x-1/2 -bottom-[5px] w-0 h-0
            border-l-[6px] border-l-transparent
            border-r-[6px] border-r-transparent
            border-t-[6px] border-t-[#0F1010]/90
          "
        />
      </div>
    </div>
  )
}

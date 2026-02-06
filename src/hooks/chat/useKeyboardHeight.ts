import { useEffect, useState } from 'react'

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight // 전체 화면 높이
      const vv = window.visualViewport?.height || vh // 현재 보이는 높이

      const diff = vh - vv
      setKeyboardHeight(diff > 10 ? diff : 0)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return keyboardHeight
}

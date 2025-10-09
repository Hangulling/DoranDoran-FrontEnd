import { useEffect, useState } from 'react'

const useScreenHeight = () => {
  const [height, setHeight] = useState(window.innerHeight)

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    handleResize() // 초기 높이 설정

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return height
}
export default useScreenHeight

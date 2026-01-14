import { useState, useCallback, useEffect, useRef } from 'react'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import showToast from '../components/common/CommonToast'

const useTTS = (text: string) => {
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  const stoppedManuallyRef = useRef(false)

  // 컴포넌트가 사라질 때(뒤로가기 등) 말하기 중단
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  const stopSpeaking = async () => {
    try {
      stoppedManuallyRef.current = true
      await TextToSpeech.stop()
      setPlaying(false)
      playingRef.current = false
    } catch {
      // 정지 중 에러 무시
    }
  }

  const play = useCallback(async () => {
    if (!text) {
      showToast({ message: 'Unable to play audio', iconType: 'error' })
      return
    }

    // 이미 재생 중이면 멈춤
    if (playingRef.current) {
      await stopSpeaking()
      return
    }

    try {
      stoppedManuallyRef.current = false
      setPlaying(true)
      playingRef.current = true

      // TTS 실행
      await TextToSpeech.speak({
        text: text,
        lang: 'ko-KR', // 한국어 설정
        rate: 1.0, // 속도
        pitch: 1.0, // 톤
        volume: 1.0, // 볼륨
      })

      // 말이 다 끝나면 실행됨
      setPlaying(false)
      playingRef.current = false
    } catch (error) {
      console.error('TTS Error:', error)
      setPlaying(false)
      playingRef.current = false
      // 수동 중지
      if (stoppedManuallyRef.current) {
        return
      }

      // 에러 발생
      showToast({ message: 'Unable to play audio', iconType: 'error' })
    }
  }, [text])

  return { onPlay: play, playing }
}

export default useTTS

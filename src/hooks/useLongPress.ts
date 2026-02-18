import { useRef, useCallback, useState } from 'react'

interface UseLongPressOptions {
  threshold?: number
  onLongPress: (position: { x: number; y: number }) => void
}

export const useLongPress = ({
  threshold = 500,
  onLongPress,
}: UseLongPressOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPressRef = useRef(false)
  const [isPressing, setIsPressing] = useState(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPressing(false)
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      didLongPressRef.current = false
      setIsPressing(true)
      const touch = e.touches[0]
      const pos = { x: touch.clientX, y: touch.clientY }
      timerRef.current = setTimeout(() => {
        didLongPressRef.current = true
        setIsPressing(false)
        onLongPress(pos)
      }, threshold)
    },
    [onLongPress, threshold],
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      didLongPressRef.current = false
      setIsPressing(true)
      const pos = { x: e.clientX, y: e.clientY }
      timerRef.current = setTimeout(() => {
        didLongPressRef.current = true
        setIsPressing(false)
        onLongPress(pos)
      }, threshold)
    },
    [onLongPress, threshold],
  )

  const onContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (didLongPressRef.current) {
      e.preventDefault()
    }
  }, [])

  return {
    onTouchStart,
    onTouchEnd: clear,
    onTouchMove: clear,
    onMouseDown,
    onMouseUp: clear,
    onMouseLeave: clear,
    onContextMenu,
    isPressing,
    didLongPressRef,
  }
}

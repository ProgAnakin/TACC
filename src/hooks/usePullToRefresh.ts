import { useState, useRef, useCallback } from 'react'

interface Options {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh({ onRefresh, threshold = 72 }: Options) {
  const startY = useRef(0)
  const latestDelta = useRef(0)
  const rafId = useRef<number>()
  const isRefreshingRef = useRef(false)
  const [pullProgress, setPullProgress] = useState(0) // 0–1
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshingRef.current) return
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startY.current || isRefreshingRef.current) return
    const delta = Math.max(0, e.touches[0].clientY - startY.current)
    latestDelta.current = delta
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        setPullProgress(prev => {
          const next = Math.min(latestDelta.current / threshold, 1)
          return Math.abs(next - prev) > 0.01 ? next : prev
        })
        rafId.current = undefined
      })
    }
  }, [threshold])

  const onTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (!startY.current) return
    const delta = e.changedTouches[0].clientY - startY.current
    startY.current = 0
    latestDelta.current = 0
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = undefined
    }

    if (delta >= threshold && !isRefreshingRef.current) {
      isRefreshingRef.current = true
      setIsRefreshing(true)
      setPullProgress(1)
      try {
        await onRefresh()
      } finally {
        isRefreshingRef.current = false
        setIsRefreshing(false)
        setPullProgress(0)
      }
    } else {
      setPullProgress(0)
    }
  }, [threshold, onRefresh])

  return { onTouchStart, onTouchMove, onTouchEnd, pullProgress, isRefreshing }
}

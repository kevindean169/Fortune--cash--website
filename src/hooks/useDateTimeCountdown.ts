import { useState, useEffect } from 'react'

export function useDateTimeCountdown(targetDateStr: string): [string, string, string, string] {
  const [secs, setSecs] = useState<number>(0)

  useEffect(() => {
    if (!targetDateStr) return

    const calculateRemaining = () => {
      const diffMs = new Date(targetDateStr).getTime() - Date.now()
      return Math.max(0, Math.floor(diffMs / 1000))
    }

    setSecs(calculateRemaining())

    const intervalId = setInterval(() => {
      setSecs(calculateRemaining())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [targetDateStr])

  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  return [
    String(d).padStart(2, '0'),
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ]
}

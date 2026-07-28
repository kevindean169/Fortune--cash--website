import { useState, useEffect } from 'react'

export function useDateTimeCountdown(targetDateStr: string, onZero?: () => void): [string, string, string, string] {
  const [secs, setSecs] = useState<number>(0)

  useEffect(() => {
    if (!targetDateStr) return

    const calculateRemaining = () => {
      let dtStr = targetDateStr.trim()
      if (dtStr) {
        if (!dtStr.endsWith('Z')) {
          dtStr = dtStr.replace(' ', 'T').substring(0, 19) + '-05:00'
        }
      }
      const diffMs = new Date(dtStr).getTime() - Date.now()
      return Math.max(0, Math.floor(diffMs / 1000))
    }

    const initialRemaining = calculateRemaining()
    setSecs(initialRemaining)
    
    // We only want to reload if it transitions to 0 while the user is on the page, 
    // or if they are actively waiting. We avoid reloading if it started at 0.
    let startedWithPositive = initialRemaining > 0;
    let hasReloaded = false;

    const intervalId = setInterval(() => {
      const remaining = calculateRemaining()
      setSecs(remaining)
      
      if (remaining === 0 && startedWithPositive && !hasReloaded) {
        hasReloaded = true;
        // The server cron runs every minute, so we wait 65 seconds 
        // after hitting 0 before calling onZero to refresh data internally.
        setTimeout(() => {
          if (onZero) {
            onZero();
          } else {
            window.location.reload();
          }
        }, 65000);
      }
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

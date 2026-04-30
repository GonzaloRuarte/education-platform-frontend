import {
  useResolutionServerNowAtSync,
  useResolutionSubmitByTime,
  useResolutionTimerSyncedMonotonicMs,
} from '@/mta_resolutions/hooks/data'
import { useMemo } from 'react'

const useResolutionDurationResources = () => {
  const submitByTime = useResolutionSubmitByTime()
  const serverNowAtSync = useResolutionServerNowAtSync()
  const timerSyncedMonotonicMs = useResolutionTimerSyncedMonotonicMs()
  const monotonicNow = typeof performance !== 'undefined' ? performance.now() : 0

  const { rawTimeLeftSeconds, computedTimeLeft, maxDurationOverflow } = useMemo(() => {
    if (!submitByTime || !serverNowAtSync || timerSyncedMonotonicMs === null) {
      return {
        rawTimeLeftSeconds: null,
        computedTimeLeft: null,
        maxDurationOverflow: null,
      }
    }

    const serverNowMs = new Date(serverNowAtSync).getTime()
    const submitByTimeMs = new Date(submitByTime).getTime()

    if (!Number.isFinite(serverNowMs) || !Number.isFinite(submitByTimeMs)) {
      return {
        rawTimeLeftSeconds: null,
        computedTimeLeft: null,
        maxDurationOverflow: null,
      }
    }

    const estimatedServerNowMs = serverNowMs + Math.max(monotonicNow - timerSyncedMonotonicMs, 0)
    const diffSeconds = Math.round((submitByTimeMs - estimatedServerNowMs) / 1000)
    return {
      rawTimeLeftSeconds: diffSeconds,
      computedTimeLeft: Math.max(diffSeconds, 0),
      maxDurationOverflow: Math.max(-diffSeconds, 0),
    }
  }, [monotonicNow, serverNowAtSync, submitByTime, timerSyncedMonotonicMs])

  const timeLeft = computedTimeLeft
  const maxDurationReached = rawTimeLeftSeconds !== null ? rawTimeLeftSeconds <= 0 : null
  const requiresMaxDurationWarning = timeLeft !== null ? 0 < timeLeft && timeLeft < 15 * 60 : null

  return {
    requiresMaxDurationWarning,
    maxDurationReached,
    timeLeft,
    maxDurationOverflow,
  }
}

export { useResolutionDurationResources }

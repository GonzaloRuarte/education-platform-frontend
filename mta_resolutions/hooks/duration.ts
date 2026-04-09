import { useResolutionElapsedTimeSeconds } from '@/mta_resolutions/hooks'
import {
  useResolutionMaxDurationMinutes,
  useResolutionServerNowAtSync,
  useResolutionSubmitByTime,
  useResolutionTimerSyncedClientEpochMs,
} from '@/mta_resolutions/hooks/data'
import { useMemo } from 'react'

const useResolutionDurationResources = () => {
  const maxDurationMinutes = useResolutionMaxDurationMinutes()
  const submitByTime = useResolutionSubmitByTime()
  const serverNowAtSync = useResolutionServerNowAtSync()
  const timerSyncedClientEpochMs = useResolutionTimerSyncedClientEpochMs()
  const elapsedTimeSeconds = useResolutionElapsedTimeSeconds()

  const { rawTimeLeftSeconds, computedTimeLeft, maxDurationOverflow } = useMemo(() => {
    if (submitByTime && serverNowAtSync && timerSyncedClientEpochMs !== null) {
      const estimatedServerNowMs =
        new Date(serverNowAtSync).getTime() + Math.max(Date.now() - timerSyncedClientEpochMs, 0)
      const submitByTimeMs = new Date(submitByTime).getTime()
      const diffSeconds = Math.round((submitByTimeMs - estimatedServerNowMs) / 1000)
      return {
        rawTimeLeftSeconds: diffSeconds,
        computedTimeLeft: Math.max(diffSeconds, 0),
        maxDurationOverflow: Math.max(-diffSeconds, 0),
      }
    }

    if (maxDurationMinutes !== null) {
      const diffSeconds = Math.round(maxDurationMinutes * 60 - elapsedTimeSeconds)
      return {
        rawTimeLeftSeconds: diffSeconds,
        computedTimeLeft: Math.max(diffSeconds, 0),
        maxDurationOverflow: Math.max(-diffSeconds, 0),
      }
    }

    return {
      rawTimeLeftSeconds: null,
      computedTimeLeft: null,
      maxDurationOverflow: null,
    }
  }, [elapsedTimeSeconds, maxDurationMinutes, serverNowAtSync, submitByTime, timerSyncedClientEpochMs])
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

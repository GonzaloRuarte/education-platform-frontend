import { useResolutionElapsedTimeSeconds } from '@/mta_resolutions/hooks'
import { useResolutionMaxDurationMinutes } from '@/mta_resolutions/hooks/data'

const useResolutionDurationResources = () => {
  const maxDurationMinutes = useResolutionMaxDurationMinutes()
  const elapsedTimeSeconds = useResolutionElapsedTimeSeconds()
  const maxDurationOverflow =
    maxDurationMinutes !== null ? Math.round(elapsedTimeSeconds - maxDurationMinutes * 60) : null
  const timeLeft =
    maxDurationMinutes !== null ? Math.max(Math.round(maxDurationMinutes * 60 - elapsedTimeSeconds), 0) : null
  const maxDurationReached =
    maxDurationMinutes !== null && maxDurationOverflow !== null ? maxDurationOverflow >= 0 : null

  const requiresMaxDurationWarning = timeLeft !== null ? 0 < timeLeft && timeLeft < 15 * 60 : null

  return {
    requiresMaxDurationWarning,
    maxDurationReached,
    timeLeft,
    maxDurationOverflow,
  }
}
export { useResolutionDurationResources }

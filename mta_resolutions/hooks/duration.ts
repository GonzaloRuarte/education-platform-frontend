import { useResolutionElapsedTimeSeconds } from '@/mta_resolutions/hooks'
import { useResolutionMaxDurationMinutes } from '@/mta_resolutions/hooks/data'

const useResolutionDurationResources = () => {
  const maxDurationMinutes = useResolutionMaxDurationMinutes() as number
  const elapsedTimeSeconds = useResolutionElapsedTimeSeconds()
  const maxDurationOverflow = Math.round(elapsedTimeSeconds - maxDurationMinutes * 60)
  const timeLeft = Math.max(Math.round(maxDurationMinutes * 60 - elapsedTimeSeconds), 0)
  const maxDurationReached = maxDurationOverflow >= 0
  const requiresMaxDurationWarning = 0 < timeLeft && timeLeft < 15 * 60

  return {
    requiresMaxDurationWarning,
    maxDurationReached,
    timeLeft,
    maxDurationOverflow,
  }
}
export { useResolutionDurationResources }

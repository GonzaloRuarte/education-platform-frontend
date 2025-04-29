import { RESOLUTIONS__REMAINING_TIME_WARNING_IN_SECONDS } from '@/config'
import { useResolutionRemainingTimeWarningAlreadyDisplayed } from '@/mta_resolutions/hooks/data'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { warningToast } from '@/shared/toasts'
import { useEffect } from 'react'

const ResolutionRemaingTimeManager = () => {
  const { timeLeft } = useResolutionDurationResources()
  const { setWarningAsAlreadyDisplayed, warningAlreadyDisplayed } = useResolutionRemainingTimeWarningAlreadyDisplayed()
  useEffect(() => {
    console.log({ timeLeft, warningAlreadyDisplayed })
    if (warningAlreadyDisplayed) return
    // if (timeLeft > 5 * 60) return
    if (timeLeft === null) return
    if (timeLeft > RESOLUTIONS__REMAINING_TIME_WARNING_IN_SECONDS) return

    warningToast('Te quedan 5 minutos para terminar la evaluación. Procurá revisar tus respuestas y entregar :)')
    setWarningAsAlreadyDisplayed()
  }, [timeLeft])

  // warningToast()
  return <></>
}

export default ResolutionRemaingTimeManager

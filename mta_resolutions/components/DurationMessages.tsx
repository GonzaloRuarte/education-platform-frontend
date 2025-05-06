import { useResolutionElapsedTimeSeconds } from '@/mta_resolutions/hooks'
import { useResolutionMaxDurationMinutes } from '@/mta_resolutions/hooks/data'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { secondsToHHMMSS } from '@/shared/utils'
import { Container } from '@mui/material'
import React from 'react'

const DurationMessages = () => {
  const { maxDurationReached, requiresMaxDurationWarning, timeLeft, maxDurationOverflow } =
    useResolutionDurationResources()

  if (timeLeft === null || maxDurationOverflow === null) return <></>
  return (
    <>
      {requiresMaxDurationWarning && (
        <section style={{ background: '#fdffd0', padding: 10 }}>
          <Container>Quedan {secondsToHHMMSS(Math.abs(timeLeft))}</Container>
        </section>
      )}
      {maxDurationReached && (
        <section style={{ background: '#ffd0d0', padding: 10 }}>
          <Container>Has superado el tiempo máximo de evaluación por {secondsToHHMMSS(maxDurationOverflow)}</Container>
        </section>
      )}
    </>
  )
}

export default DurationMessages

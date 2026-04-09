import { useResolutionMaxDurationMinutes } from '@/mta_resolutions/hooks/data'
import { I_EvaluationToResolve } from '@/mta_resolutions/types'
import HTMLParser from '@/shared/components/HTMLParser'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { HorizontalRule } from '@mui/icons-material'
import { FC } from 'react'

const ResolutionHeader: FC<{ evaluationToResolve: I_EvaluationToResolve }> = ({ evaluationToResolve }) => {
  const maxDurationMinutes = useResolutionMaxDurationMinutes()

  return (
    <>
      <Spacer />
      <HTMLParser htmlContent={evaluationToResolve.header} />
      <Spacer />

      {maxDurationMinutes !== null ? <Body1>Tenés {maxDurationMinutes} minutos para trabajar.</Body1> : null}
      <Spacer />

      <H3>¡Comencemos!</H3>
      <Spacer />

      <HorizontalRule />
    </>
  )
}

export default ResolutionHeader

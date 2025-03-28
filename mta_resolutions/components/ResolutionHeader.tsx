import { I_EvaluationToResolve, I_ResumeResolutionResponse } from '@/mta_resolutions/types'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { HorizontalRule } from '@mui/icons-material'
import { FC } from 'react'

const ResolutionHeader: FC<{ evaluationToResolve: I_EvaluationToResolve }> = ({ evaluationToResolve }) => {
  return (
    <>
      <Spacer />
      <Body1>{evaluationToResolve.header}</Body1>
      <Spacer />
      <Body1>Tenés 80 minutos para trabajar.</Body1>
      <Spacer />
      <H3>¡Comencemos!</H3>
      <Spacer />
      <HorizontalRule />
    </>
  )
}

export default ResolutionHeader

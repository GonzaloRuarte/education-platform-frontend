import { I_EvaluationToResolve } from '@/mta_resolutions/types'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { HorizontalRule } from '@mui/icons-material'
import parse from 'html-react-parser'
import { FC } from 'react'

const ResolutionHeader: FC<{ evaluationToResolve: I_EvaluationToResolve }> = ({ evaluationToResolve }) => {
  return (
    <>
      <Spacer />
      <>{parse(evaluationToResolve.header)}</>
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

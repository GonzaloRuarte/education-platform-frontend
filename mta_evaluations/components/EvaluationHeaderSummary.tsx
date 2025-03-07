import { useNavigateToEvaluationDetail } from '@/mta_evaluations/hooks'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { Paper } from '@mui/material'
import parse from 'html-react-parser'
import { FC } from 'react'

const EvaluationHeaderSummary: FC<{ data: I_EvaluationDetail }> = ({ data }) => {
  const navigateToEvaluationDetail = useNavigateToEvaluationDetail()
  return (
    <>
      <Paper variant="elevation" style={{ padding: 20 }}>
        <H3>{data.title}</H3>
        <Body1>{data.subject_id}</Body1>
        <Spacer space="s" />
        <>{parse(data.header)}</>
        <Spacer />
        <Button onClick={() => navigateToEvaluationDetail(data.id)}>Editar encabezado</Button>
      </Paper>
    </>
  )
}

export default EvaluationHeaderSummary

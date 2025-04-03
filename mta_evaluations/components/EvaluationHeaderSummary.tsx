import { useNavigateToEvaluationDetail } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { strippedString, truncateWithEllipsis } from '@/shared/utils'
import { Grid2, Paper } from '@mui/material'
import parse from 'html-react-parser'
import { FC } from 'react'

const EvaluationHeaderSummary: FC<{ data: I_EvaluationDetail }> = ({ data }) => {
  const navigateToEvaluationDetail = useNavigateToEvaluationDetail()
  return (
    <>
      <Paper variant="elevation" style={{ padding: 20, borderRadius: 20 }} elevation={4}>
        <H3>{data.title}</H3>
        <Body1>{data.subject_id}</Body1>
        <Spacer size="s" />
        <Grid2 container columnGap={3} alignItems={'center'}>
          <Grid2 size={'auto'}>
            <Body1 fontStyle="italic" color="gray">
              {evaluationLabels.header}
            </Body1>
          </Grid2>
          <Grid2 size={'grow'}>
            <>{parse(data.header)}</>
          </Grid2>
        </Grid2>
        {data.pinned_text !== null && (
          <Grid2 container columnGap={3} alignItems={'center'}>
            <Grid2 size={'auto'}>
              <Body1 fontStyle="italic" color="gray">
                {evaluationLabels.pinnedText}
              </Body1>
            </Grid2>
            <Grid2 size={'grow'}>
              <>{truncateWithEllipsis(strippedString(data.pinned_text))}</>
            </Grid2>
          </Grid2>
        )}

        <Spacer />
        <Button onClick={() => navigateToEvaluationDetail(data.id)}>Editar encabezado</Button>
      </Paper>
    </>
  )
}

export default EvaluationHeaderSummary

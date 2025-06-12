import { useNavigateToEvaluationDetail, useEvaluationPageCreate } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationDetail } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import HTMLParser from '@/shared/components/HTMLParser'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { Grid2, Paper } from '@mui/material'
import { FC } from 'react'
import { T_VoidFn } from '@/shared/types'
import { handleServiceError } from '@/shared/service'
import MagicGrid from '@/shared/components/MagicGrid'
import { successToast } from '@/shared/toasts'

const EvaluationHeaderSummary: FC<{ data: I_EvaluationDetail, reload: T_VoidFn }> = ({ data, reload }) => {
  const navigateToEvaluationDetail = useNavigateToEvaluationDetail()
  const createEvaluationPage = useEvaluationPageCreate()
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
            <HTMLParser htmlContent={data.header} />
          </Grid2>
        </Grid2>

        <Spacer />
        <MagicGrid itemSize={'auto'}>
          <Button
          disabled={data.status === EvaluationStatus.Published}
          onClick={() => navigateToEvaluationDetail(data.id)}
        >
          Editar
        </Button>
          <Button
          disabled={data.status === EvaluationStatus.Published}
          onClick={() => createEvaluationPage({ evaluation_id: data.id })
            .then(() => {
              successToast('Página de evaluación creada correctamente')
              reload()
              
            })
            .catch(handleServiceError)
          }
        >
          Crear página de evaluación
        </Button>


        </MagicGrid>

      </Paper>
    </>
  )
}

export default EvaluationHeaderSummary

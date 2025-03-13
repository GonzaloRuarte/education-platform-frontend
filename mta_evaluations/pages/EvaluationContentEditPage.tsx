'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import EvaluationHeaderSummary from '@/mta_evaluations/components/EvaluationHeaderSummary'
import EvaluationQuestionsManager from '@/mta_evaluations/components/EvaluationQuestionsManager'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

const EvaluationContentEditPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const { data, reload } = useEvaluationDetail(Number(evaluationId))

  const navigateToList = useNavigateToEvaluationList()
  const deleteInstance = useEvaluationDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const handleDelete = useHandleDelete(evaluationId, { showConfirm, deleteInstance, callback: navigateToList, entityName: EVALUATION_NAME })

  useEffect(reload, [evaluationId])

  return (
    <>
      <Page>
        <Page.Title>Editar contenio de {EVALUATION_NAME.singular}</Page.Title>
        <Page.Toolbar>
          <Button onClick={reload} startIcon={<ReplayIcon />}>
            {sharedLabels.update}
          </Button>
          <Button onClick={navigateToList} startIcon={<ClearIcon />}>
            {sharedLabels.cancel}
          </Button>
          <Button onClick={handleDelete} startIcon={<DeleteIcon />}>
            {sharedLabels.delete}
          </Button>
        </Page.Toolbar>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <Page.Content>
              <EvaluationHeaderSummary {...{ data }} />
              <Spacer space="l" />
              <EvaluationQuestionsManager {...{ data, reload }} />
            </Page.Content>
          </>
        )}
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

export default withAuth(EvaluationContentEditPage, ['admin', 'evaluator'])

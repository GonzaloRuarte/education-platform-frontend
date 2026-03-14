'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import EvaluationHeaderSummary from '@/mta_evaluations/components/EvaluationHeaderSummary'
import EvaluationQuestionsManager from '@/mta_evaluations/components/EvaluationQuestionsManager'
import { EvaluationStatusSelect } from '@/mta_evaluations/components/EvaluationStatusSelect'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationDelete,
  useEvaluationDetail,
  useEvaluationSetStatus,
  useNavigateToEvaluationList,
} from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, T_EvaluationStatusCode } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import { BackButton, DeleteButton, ReloadButton } from '@/shared/components/buttons'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete, useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import PreviewIcon from '@mui/icons-material/Preview'
import { evaluationsPreviewPath } from '@/pages'

const EvaluationContentEditPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const { data, reload } = useEvaluationDetail(Number(evaluationId))
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const navigateToList = useNavigateToEvaluationList()
  const href = evaluationsPreviewPath.replace('{evaluationId:number}', String(evaluationId))
  const deleteInstance = useEvaluationDelete()
  const setStatus = useEvaluationSetStatus()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const handleDelete = useHandleDelete(evaluationId, {
    showConfirm,
    deleteInstance,
    callback: navigateToList,
    entityName: EVALUATION_NAME,
  })
  const handleStatusChange = (new_status: T_EvaluationStatusCode) => {
    if (data === undefined) return

    showConfirm(evaluationLabels.statuses.change, evaluationLabels.statuses.areYouSure).then(() => {
      setIsInProgress()
      setStatus({ id: data.id, new_status })
        .catch(handleServiceError)
        .finally(() => {
          reload()
          setIsNotInProgress()
        })
    })
  }

  useEffect(reload, [evaluationId])

  return (
    <>
      <Page>
        <Page.Title>Editar contenido de {EVALUATION_NAME.singular}</Page.Title>
        <Page.Toolbar
          right={
            data !== undefined && (
              <Box display="flex" flexDirection="row" gap={2} justifyContent={'flex-end'}>

                <Button
                  startIcon={<PreviewIcon />}
                  onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
                  >
                  Vista previa
                </Button>
                <EvaluationStatusSelect
                  size="small"
                  onChange={handleStatusChange}
                  label={evaluationLabels.status}
                  value={data.status}
                />
              </Box>
            )
          }
        >
          <BackButton onClick={navigateToList} />
          <ReloadButton onClick={reload} />

          <DeleteButton onClick={handleDelete} color="error" disabled={data?.status === EvaluationStatus.Published} />
        </Page.Toolbar>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <Page.Content>
              <EvaluationHeaderSummary {...{ data, reload }} />
              <Spacer size="l" />
              <EvaluationQuestionsManager {...{ data, reload }} />
            </Page.Content>
          </>
        )}
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

export default withAuth(EvaluationContentEditPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

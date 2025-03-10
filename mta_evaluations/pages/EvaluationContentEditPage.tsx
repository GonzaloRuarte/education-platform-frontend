'use client'

import EvaluationHeaderSummary from '@/mta_evaluations/components/EvaluationHeaderSummary'
import EvaluationQuestionsManager from '@/mta_evaluations/components/EvaluationQuestionsManager'
import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { I_EvaluationDetail, T_EvaluationId } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const entityName = 'Evaluación'

const EvaluationContentEditPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const { data, reload } = useEvaluationDetail(Number(evaluationId))

  const navigateToList = useNavigateToEvaluationList()
  const deleteInstance = useEvaluationDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const handleDelete = useHandleDelete(evaluationId, { showConfirm, deleteInstance, callback: navigateToList, entityName })

  useEffect(reload, [evaluationId])

  return (
    <>
      <Page>
        <Page.Title>Editar contenio de {entityName}</Page.Title>
        <Page.Toolbar>
          <Button onClick={reload} startIcon={<ReplayIcon />}>
            Actualizar
          </Button>
          <Button onClick={navigateToList} startIcon={<ClearIcon />}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} startIcon={<DeleteIcon />}>
            Eliminar
          </Button>
        </Page.Toolbar>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <Page.Content>
              <EvaluationHeaderSummary {...{ data }} />
              <Spacer />
              <EvaluationQuestionsManager {...{ data }} />
            </Page.Content>
          </>
        )}
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

export default EvaluationContentEditPage

'use client'

import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationDetail, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { I_EvaluationDetail, T_EvaluationId } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H3 } from '@/shared/components/Typography'
import { Paper } from '@mui/material'
import parse from 'html-react-parser'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import { useHandleDelete } from '@/shared/hooks'
import { useConfirm } from '@/shared/confirm'

const entityName = 'Evaluación'
const EvaluationContentEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const detail = useEvaluationDetail()
  const [data, setData] = useState<I_EvaluationDetail | undefined>(undefined)
  const navigateToEvaluationDetail = useNavigateToEvaluationDetail()
  const navigateToList = useNavigateToEvaluationList()
  const deleteInstance = useEvaluationDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const handleDelete = useHandleDelete(id, { showConfirm, deleteInstance, callback: navigateToList, entityName })

  useEffect(() => {
    detail(id as unknown as T_EvaluationId).then(setData)
  }, [id])

  return (
    <>
      <Page>
        <Page.Title>Editar contenio de {entityName}</Page.Title>
        <Page.Toolbar>
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
              <Paper variant="elevation" style={{ padding: 20 }}>
                <H3>{data.title}</H3>
                <Body1>{data.subject_id}</Body1>
                <Spacer space="s" />
                <>{parse(data.header)}</>
                {/* <Body2>{data.header}</Body2> */}
                <Spacer />
                <Button onClick={() => navigateToEvaluationDetail(id)}>Editar encabezado</Button>
              </Paper>
            </Page.Content>
          </>
        )}
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

export default EvaluationContentEditPage

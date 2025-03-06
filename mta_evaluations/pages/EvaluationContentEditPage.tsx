'use client'

import { useEvaluationDetail, useNavigateToEvaluationDetail } from '@/mta_evaluations/hooks'
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
const EvaluationContentEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const detail = useEvaluationDetail()
  const [data, setData] = useState<I_EvaluationDetail | undefined>(undefined)
  const navigateToEvaluationDetail = useNavigateToEvaluationDetail()

  useEffect(() => {
    detail(id as unknown as T_EvaluationId).then(setData)
  }, [id])

  return (
    <Page>
      <Page.Title>Editar contenido de Evaluación</Page.Title>
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
  )
}

export default EvaluationContentEditPage

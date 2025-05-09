'use client'

import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationPreview, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Pagination } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

const EvaluationPreviewPage = () => {
  const { evaluationId } = useParams()
  const { data, reload } = useEvaluationPreview({ evaluationId: Number(evaluationId) })
  const [page, setPage] = React.useState(1)
  const navToDetail = useNavigateToEvaluationContentEdit()
  return (
    <Page>
      <Page.Title>Vista previa de {EVALUATION_NAME.singular}</Page.Title>
      <Page.BasicToolbar
        reload={reload}
        entityName={EVALUATION_NAME}
        id={Number(evaluationId)}
        onExit={() => navToDetail({ evaluationId: Number(evaluationId) })}
      />
      <Spacer />
      <Page.Content>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            {data.pages_quantity > 1 && (
              <>
                <Pagination
                  count={data.pages_quantity}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value)
                  }}
                />
                <Spacer />
              </>
            )}
            <ResolutionQuestions evaluationToResolve={data} currentPage={page} />
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default EvaluationPreviewPage

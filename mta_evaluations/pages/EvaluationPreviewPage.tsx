'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationPreview, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Pagination } from '@mui/material'
import { useParams } from 'next/navigation'
import { Box} from '@mui/material'
import React from 'react';
import {StickyPinned} from '@/shared/components/StickyPinned'







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
            {data.pages_quantity > 0 && (
              <>
                <Pagination
                  count={data.pages_quantity}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value)
                    
                  }}
                />
                <Spacer />
              {page === 1 && (
                  <>
                    {/* ── RESOLUTION HEADER ────────────────────── */}
                    <ResolutionHeader evaluationToResolve={data} />
                    <Spacer size="l" />
                  </>
                  )}
            
                  {/* ── STICKY BANNER ─────────────────────────── */}
              <StickyPinned text={data.pages[page - 1].pinned_text} />

              {/* ── SCROLLABLE QUESTIONS AREA ─────────────── */}
              <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                <ResolutionQuestions evaluationToResolve={data} currentPage={page} />
              </Box>
            </>
            )}
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(EvaluationPreviewPage, {
  allowedUserProfiles: ['admin', 'evaluator'],
  logoutDestination: 'dashboard',
})

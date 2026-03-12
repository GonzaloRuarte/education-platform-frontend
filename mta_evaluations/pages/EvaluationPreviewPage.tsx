'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationPreview } from '@/mta_evaluations/hooks'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import ResolutionPaginatorView from '@/mta_resolutions/components/ResolutionPaginatorView'
import { Body1 } from '@/shared/components/Typography'
import { HorizontalRule } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { Box } from '@mui/material'
import React from 'react';
import { StickyPinned } from '@/shared/components/StickyPinned'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import 'react-quill-new/dist/quill.snow.css'






const EvaluationPreviewPage = () => {
  const { evaluationId } = useParams()
  const { data } = useEvaluationPreview({ evaluationId: Number(evaluationId) })
  const [page, setPage] = React.useState(1)

  return (
    <Page>
      <Page.Title>Vista previa de {EVALUATION_NAME.singular}</Page.Title>

      <Spacer />
      <Page.Content>





        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            {data.pages_quantity > 0 && (
              <>
                <Box position="relative">
                  <Box width="100%">

                    {page === 1 && (
                      <>
                        {/* ── RESOLUTION HEADER ────────────────────── */}
                        <div className="quill ">
                          <div className="ql-editor">
                            <ResolutionHeader evaluationToResolve={data} />
                          </div>
                        </div>
                        <Spacer size="l" />
                      </>
                    )}
                    <ResolutionPaginatorView
                      isFirstPage={page === 1}
                      isLastPage={page === data.pages_quantity}
                      onPrev={() => setPage((p) => Math.max(1, p - 1))}
                      onNext={() => setPage((p) => Math.min(data.pages_quantity, p + 1))}
                      renderLast={<Body1>Última página</Body1>}
                    />
                    <Spacer size="s" />
                    {/* ── STICKY BANNER ─────────────────────────── */}
                    <StickyPinned text={data.pages[page - 1].pinned_text} />
                    <Spacer size="xl" />
                    {/* ── SCROLLABLE QUESTIONS AREA ─────────────── */}
                    <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                      <div className="quill ">
                        <div className="ql-editor">
                          <ResolutionQuestions evaluationToResolve={data} currentPage={page} />
                        </div>
                      </div>
                    </Box>
                    <Spacer size="s" />
                    <ResolutionReviewDisclaimer />
                    <Spacer size="s" />
                    <HorizontalRule />
                    <Spacer size="s" />
                    <ResolutionPaginatorView
                      isFirstPage={page === 1}
                      isLastPage={page === data.pages_quantity}
                      onPrev={() => setPage((p) => Math.max(1, p - 1))}
                      onNext={() => setPage((p) => Math.min(data.pages_quantity, p + 1))}
                      renderLast={<Body1>Última página</Body1>}
                    />
                    <Spacer size="xl" />
                  </Box>
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
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

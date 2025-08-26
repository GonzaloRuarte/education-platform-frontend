'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationPreview } from '@/mta_evaluations/hooks'
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
                    <div className="quill ">
                      <div className="ql-editor">
                        <ResolutionHeader evaluationToResolve={data} />
                      </div>
                    </div>
                    <Spacer size="l" />
                  </>
                  )}
            
                  {/* ── STICKY BANNER ─────────────────────────── */}
              <StickyPinned text={data.pages[page - 1].pinned_text} />

              {/* ── SCROLLABLE QUESTIONS AREA ─────────────── */}
              <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                <div className="quill ">
                  <div className="ql-editor">
                    <ResolutionQuestions evaluationToResolve={data} currentPage={page} />
                  </div>
                </div>
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

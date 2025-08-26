'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import ResolutionRemaingTimeManager from '@/mta_resolutions/services/ResolutionRemaingTimeManager'
import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
import ResolutionUploadStateManager from '@/mta_resolutions/services/ResolutionUploadStateManager'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import OfflineIndicator from '@/shared/offline/OfflineIndicator'
import { HorizontalRule } from '@mui/icons-material'
import { Box } from '@mui/material'
import { StickyPinned } from '@/shared/components/StickyPinned'
import { warningToast } from '@/shared/toasts'
import { useEffect, useRef } from 'react'
import { useResolutionLogout } from '@/mta_resolutions/hooks'
import 'react-quill-new/dist/quill.snow.css'

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()

  // ⏱️ time left & logout
  const { timeLeft } = useResolutionDurationResources()
  const resolutionLogout = useResolutionLogout()

  // Avoid duplicate kicks (StrictMode / rapid updates)
  const didKickRef = useRef(false)

  useEffect(() => {
    if (didKickRef.current) return
    // If timeLeft is unknown yet, do nothing. When it's known and <= 0, kick.
    if (timeLeft == null) return
    if (timeLeft <= 0) {
      didKickRef.current = true
      warningToast('Se terminó el tiempo de la evaluación.')
      // Clear resolution session and send user out of the resolution flow
      resolutionLogout()
    }
  }, [timeLeft, resolutionLogout])

  return (
    <>
      <OfflineIndicator />
      <ResolutionResumingManager />
      <ResolutionUploadStateManager />
      <ResolutionRemaingTimeManager />

      <Page>
        <Page.Content>
          {evaluationToResolve === null ? (
            <Spinner />
          ) : (
            <>
              <Box position="relative">
                <Box width="100%">
                  {currentPage === 1 ? (
                    <div className="quill">
                      <div className="ql-editor">
                        <ResolutionHeader evaluationToResolve={evaluationToResolve} />
                      </div>
                    </div>
                  ) : (
                    <Spacer size="l" />
                  )}

                  <StickyPinned text={evaluationToResolve.pages[currentPage - 1].pinned_text} />
                  <Spacer size="xl" />

                  <div className="quill">
                    <div className="ql-editor">
                      <ResolutionQuestions {...{ evaluationToResolve, currentPage }} />
                    </div>
                  </div>

                  <Spacer size="s" />
                  <ResolutionReviewDisclaimer />
                  <Spacer size="s" />
                  <HorizontalRule />
                  <Spacer size="s" />
                  <ResolutionPaginator />
                  <Spacer size="xl" />
                </Box>
              </Box>
            </>
          )}
        </Page.Content>
      </Page>
    </>
  )
}

export default withAuth(ResolveEvaluationPage, {
  allowedUserProfiles: ['admin', 'student'],
  logoutDestination: 'resolutions',
})

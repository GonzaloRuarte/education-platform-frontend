'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
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

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
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
              <Box position={'relative'}>
                <Box width={'100%'}>
                  {currentPage === 1 ? (
                    <ResolutionHeader evaluationToResolve={evaluationToResolve} />
                  ) : (
                    <Spacer size="l" />
                  )}

                  {/* <ResolutionPageIndicator /> */}
                  <Spacer size="xl" />

                  <ResolutionQuestions {...{ evaluationToResolve, currentPage }} />

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

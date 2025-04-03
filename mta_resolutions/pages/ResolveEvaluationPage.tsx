'use client'

import { LIGHT_BG_COLOR } from '@/config'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPageIndicator from '@/mta_resolutions/components/ResolutionPageIndicator'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
import ResolutionUploadStateManager from '@/mta_resolutions/services/ResolutionUploadStateManager'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { HorizontalRule } from '@mui/icons-material'
import { Box, Grid2 } from '@mui/material'
import parse from 'html-react-parser'
const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
  const hasPinnedText = evaluationToResolve?.pinned_text !== null
  return (
    <>
      <ResolutionResumingManager />
      <ResolutionUploadStateManager />
      <Page>
        <Page.Content>
          {evaluationToResolve === null ? (
            <Spinner />
          ) : (
            <>
              <Box position={'relative'}>
                <Box width={hasPinnedText ? '50%' : '100%'}>
                  {currentPage === 1 ? (
                    <ResolutionHeader evaluationToResolve={evaluationToResolve} />
                  ) : (
                    <Spacer size="l" />
                  )}

                  <ResolutionPageIndicator />
                  <Spacer size="xl" />

                  <ResolutionQuestions evaluationToResolve={evaluationToResolve} />

                  <Spacer size="s" />

                  <ResolutionReviewDisclaimer />
                  <Spacer size="s" />

                  <HorizontalRule />
                  <Spacer size="s" />
                  <ResolutionPaginator />
                  <Spacer size="xl" />
                </Box>
                {hasPinnedText && (
                  <Box
                    style={{
                      transform: 'translateY(-50%)',
                      width: '40%',
                      right: 20,
                      top: '50%',
                      position: 'fixed',
                      height: '70%',
                      borderRadius: 20,
                      padding: '10px 30px',
                      overflowY: 'auto',
                    }}
                    bgcolor={LIGHT_BG_COLOR}
                  >
                    {parse(evaluationToResolve.pinned_text as string)}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Page.Content>
      </Page>
    </>
  )
}

export default ResolveEvaluationPage

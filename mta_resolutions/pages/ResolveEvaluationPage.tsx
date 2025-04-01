'use client'

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

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
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
              {currentPage === 1 ? <ResolutionHeader evaluationToResolve={evaluationToResolve} /> : <Spacer size="l" />}

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
            </>
          )}
        </Page.Content>
      </Page>
    </>
  )
}

export default ResolveEvaluationPage

'use client'

import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPageIndicator from '@/mta_resolutions/components/ResolutionPageIndicator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import { useResolutionEvaluationToResolve, useResolutionPagination } from '@/mta_resolutions/hooks'
import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
  return (
    <>
      <ResolutionResumingManager />
      <Page>
        <Page.Content>
          {evaluationToResolve === undefined ? (
            <Spinner />
          ) : (
            <>
              {currentPage === 1 && <ResolutionHeader evaluationToResolve={evaluationToResolve} />}
              <ResolutionPageIndicator />
              <ResolutionQuestions evaluationToResolve={evaluationToResolve} />
            </>
          )}
        </Page.Content>
      </Page>
    </>
  )
}

export default ResolveEvaluationPage

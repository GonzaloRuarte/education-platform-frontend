'use client'

import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPageIndicator from '@/mta_resolutions/components/ResolutionPageIndicator'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import { useResolutionEvaluationToResolve, useResolutionPagination } from '@/mta_resolutions/hooks/data'
import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
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
      <Page>
        <Page.Content>
          {evaluationToResolve === undefined ? (
            <Spinner />
          ) : (
            <>
              {currentPage === 1 ? <ResolutionHeader evaluationToResolve={evaluationToResolve} /> : <Spacer size="l" />}

              <ResolutionPageIndicator />
              <Spacer size="xl" />

              <ResolutionQuestions evaluationToResolve={evaluationToResolve} />
              <Spacer size="s" />
              <HorizontalRule />

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

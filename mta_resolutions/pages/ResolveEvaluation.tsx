import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
import Page from '@/shared/components/Page'

const ResolveEvaluation = () => {
  return (
    <>
      <ResolutionResumingManager />
      <Page>
        <Page.Title>Resolver Evaluación</Page.Title>
      </Page>
    </>
  )
}

export default ResolveEvaluation

import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionHandlePageAction, useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { useResolutionManageUploadState, useResolutionRequiresFinalizationOnAction } from '@/mta_resolutions/hooks/data'
import { T_VoidFn } from '@/shared/types'
import { Body1 } from '@/shared/components/Typography'

import ResolutionPaginatorView from '@/mta_resolutions/components/ResolutionPaginatorView'

const ResolutionPaginator = () => {
  const { isLastPage, isFirstPage, goToPreviousPage, goToNextPage, canSubmitOrForwardPage } = useResolutionPagination()
  const { maxDurationReached } = useResolutionDurationResources()
  const requiresFinalizationOnAction = useResolutionRequiresFinalizationOnAction()
  const handlePageAction = useResolutionHandlePageAction()
  const manageUpload = useResolutionManageUploadState()

  const mustFinalizeOnAction = maxDurationReached === true || requiresFinalizationOnAction

  const safePageMovement = (fn: T_VoidFn) => {
    return () => {
      if (!mustFinalizeOnAction) return fn()
      void handlePageAction(fn)
    }
  }

  const nextPageWithUpload = () => {
    try {
      manageUpload() // fire-and-forget
    } catch {
      // swallow
    }
    goToNextPage()
  }

  return (
    <ResolutionPaginatorView
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      canForward={canSubmitOrForwardPage}
      onPrev={safePageMovement(goToPreviousPage)}
      onNext={safePageMovement(nextPageWithUpload)}
      nextLabel={!mustFinalizeOnAction ? 'Siguiente' : 'Entregar'}
      cantForwardText="Para avanzar necesitas completar todas las preguntas"
      renderLast={
        <>
          {!canSubmitOrForwardPage && <Body1>Para entregar necesitas completar todas las preguntas</Body1>}
          <SubmitEvaluation disabled={!canSubmitOrForwardPage} />
        </>
      }
    />
  )
}

export default ResolutionPaginator

import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionManageSubmit, useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { useResolutionManageUploadState } from '@/mta_resolutions/hooks/data'
import { T_VoidFn } from '@/shared/types'
import { warningToast } from '@/shared/toasts'
import { Body1 } from '@/shared/components/Typography'

import ResolutionPaginatorView from '@/mta_resolutions/components/ResolutionPaginatorView'

const ResolutionPaginator = () => {
  const { isLastPage, isFirstPage, goToPreviousPage, goToNextPage, canSubmitOrForwardPage } = useResolutionPagination()
  const { maxDurationReached } = useResolutionDurationResources()
  const submit = useResolutionManageSubmit()
  const manageUpload = useResolutionManageUploadState()

  const safePageMovement = (fn: T_VoidFn) => {
    return () => {
      if (maxDurationReached === null || !maxDurationReached) return fn()
      warningToast(
        'La evaluación se ha entregado porque has superado el tiempo máximo para realizarla. ¡Gracias por tu esfuerzo, bien hecho!',
      )
      submit()
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
      nextLabel={!maxDurationReached ? 'Siguiente' : 'Entregar'}
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
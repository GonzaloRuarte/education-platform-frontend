import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionManageSubmit, useResolutionPagination } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { T_VoidFn } from '@/shared/types'
import { warningToast } from '@/shared/toasts'
import { Body1 } from '@/shared/components/Typography'
import MagicGrid from '@/shared/components/MagicGrid'
import { useResolutionManageUploadState } from '@/mta_resolutions/hooks/data'

const ResolutionPaginator = () => {
  const { isLastPage, isFirstPage, goToPreviousPage, goToNextPage, canSubmitOrForwardPage } = useResolutionPagination()
  const { maxDurationReached } = useResolutionDurationResources()
  const submit = useResolutionManageSubmit()
  const manageUpload = useResolutionManageUploadState() // ⟵ NEW

  const safePageMovement = (fn: T_VoidFn) => {
    return () => {
      if (maxDurationReached === null || !maxDurationReached) return fn()
      warningToast(
        'La evaluación se ha entregado porque has superado el tiempo máximo para realizarla. ¡Gracias por tu esfuerzo, bien hecho!',
      )
      submit()
    }
  }
  // ⟵ NEW: only used for "Siguiente"
  // Runs upload management BEFORE moving forward; fire-and-forget; never blocks navigation.
  const nextPageWithUpload = () => {
    try {
      manageUpload() // do not await
    } catch {
      // swallow errors to avoid distracting the student
    }
    goToNextPage()
  }
  return (
    <Grid container>
      <Grid>
        {!isFirstPage && (
          <Button variant="outlined" onClick={safePageMovement(goToPreviousPage)} startIcon={<ArrowBackIcon />}>
            Anterior
          </Button>
        )}
      </Grid>
      <Grid size="grow"></Grid>
      <Grid>
        {!isLastPage ? (
          <MagicGrid itemSize="auto">
            {!canSubmitOrForwardPage && <Body1>Para avanzar necesitas completar todas las preguntas</Body1>}
            <Button
              disabled={!canSubmitOrForwardPage}
              endIcon={<ArrowForwardIcon />}
              onClick={safePageMovement(nextPageWithUpload)}
            >
              {!maxDurationReached ? 'Siguiente' : 'Entregar'}
            </Button>
          </MagicGrid>
        ) : (
          <MagicGrid itemSize="auto">
            {!canSubmitOrForwardPage && <Body1>Para entregar necesitas completar todas las preguntas</Body1>}
            <SubmitEvaluation disabled={!canSubmitOrForwardPage} />
          </MagicGrid>
        )}
      </Grid>
    </Grid>
  )
}
export default ResolutionPaginator

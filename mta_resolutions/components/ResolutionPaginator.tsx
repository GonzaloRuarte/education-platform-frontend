import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionManageSubmit, useResolutionPagination } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { T_VoidFn } from '@/shared/types'
import { warningToast } from '@/shared/toasts'

const ResolutionPaginator = () => {
  const { isLastPage, isFirstPage, goToPreviousPage, goToNextPage } = useResolutionPagination()
  const { maxDurationReached } = useResolutionDurationResources()
  const submit = useResolutionManageSubmit()

  const safePageMovement = (fn: T_VoidFn) => {
    return () => {
      if (maxDurationReached === null || !maxDurationReached) return fn()
      warningToast(
        'La evaluación se ha entregado porque has superado el tiempo máximo para realizarla. ¡Gracias por tu esfuerzo, bien hecho!',
      )
      submit()
    }
  }

  return (
    <Grid container>
      <Grid>
        {!isFirstPage && (
          <Button variant="outlined" onClick={safePageMovement(goToPreviousPage)} startIcon={<ArrowBackIcon />}>
            Anterior
          </Button>
        )}

        {/* <Pagination count={pagesQuantity} variant="outlined" page={currentPage} onChange={(_, p) => storeNewPage(p)} /> */}
      </Grid>
      <Grid size="grow"></Grid>
      <Grid>
        {!isLastPage ? (
          <Button endIcon={<ArrowForwardIcon />} onClick={safePageMovement(goToNextPage)}>
            Siguiente
          </Button>
        ) : (
          <SubmitEvaluation />
        )}
      </Grid>
    </Grid>
  )
}
export default ResolutionPaginator

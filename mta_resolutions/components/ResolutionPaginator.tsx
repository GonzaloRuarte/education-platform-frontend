import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const ResolutionPaginator = () => {
  const { isLastPage, isFirstPage, goToPreviousPage, goToNextPage } = useResolutionPagination()

  return (
    <Grid container>
      <Grid>
        {!isFirstPage && (
          <Button variant="outlined" onClick={goToPreviousPage} startIcon={<ArrowBackIcon />}>
            Anterior
          </Button>
        )}

        {/* <Pagination count={pagesQuantity} variant="outlined" page={currentPage} onChange={(_, p) => storeNewPage(p)} /> */}
      </Grid>
      <Grid size="grow"></Grid>
      <Grid>
        {!isLastPage ? (
          <Button endIcon={<ArrowForwardIcon />} onClick={goToNextPage}>
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

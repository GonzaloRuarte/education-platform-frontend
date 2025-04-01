import SubmitEvaluation from '@/mta_resolutions/components/SubmitEvaluationButton'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Grid from '@mui/material/Grid2'
import Pagination from '@mui/material/Pagination'

const ResolutionPaginator = () => {
  const { currentPage, pagesQuantity, storeNewPage, isLastPage } = useResolutionPagination()

  return (
    <Grid container>
      <Grid>
        <Pagination count={pagesQuantity} variant="outlined" page={currentPage} onChange={(_, p) => storeNewPage(p)} />
      </Grid>
      <Grid size="grow"></Grid>
      <Grid>{isLastPage && <SubmitEvaluation />}</Grid>
    </Grid>
  )
}
export default ResolutionPaginator

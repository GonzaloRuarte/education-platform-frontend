import { useResolutionPagination } from '@/mta_resolutions/hooks/data'
import Pagination from '@mui/material/Pagination'

const ResolutionPaginator = () => {
  const { currentPage, pagesQuantity, storeNewPage } = useResolutionPagination()
  return <Pagination count={pagesQuantity} variant="outlined" page={currentPage} onChange={(_, p) => storeNewPage(p)} />
}
export default ResolutionPaginator

import { I_FetchPaginationOptions } from '@/shared/data/types'
import { GridPaginationModel } from '@mui/x-data-grid'

const paginationModelAsFetchPaginationOptions = (paginationModel: GridPaginationModel): I_FetchPaginationOptions => {
  return { page: paginationModel.page + 1, page_size: paginationModel.pageSize }
}
export { paginationModelAsFetchPaginationOptions }

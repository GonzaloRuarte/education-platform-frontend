import { I_FetchPaginationOptions } from '@/shared/data/types'
import { Tooltip } from '@mui/material'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'

const paginationModelAsFetchPaginationOptions = (paginationModel: GridPaginationModel): I_FetchPaginationOptions => {
  return { page: paginationModel.page + 1, page_size: paginationModel.pageSize }
}

const idReplacementColumn = ({ ...fields }, idFieldName = 'id'): GridColDef => {
  // @ts-expect-error
  return {
    ...fields,
    renderCell: (params) => (
      <>
        <Tooltip placement="right" title={`Id ${params.row[idFieldName]}`}>
          {params.value}
        </Tooltip>
      </>
    ),
  }
}
export { paginationModelAsFetchPaginationOptions, idReplacementColumn }

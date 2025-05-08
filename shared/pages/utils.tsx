import { I_FetchPaginationOptions } from '@/shared/data/types'
import { Box, Tooltip } from '@mui/material'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { JSX } from 'react'

const paginationModelAsFetchPaginationOptions = (paginationModel: GridPaginationModel): I_FetchPaginationOptions => {
  return { page: paginationModel.page + 1, page_size: paginationModel.pageSize }
}

interface I_ColumnReplacement extends Omit<GridColDef, 'renderCell'> {
  renderCell?: (params: any) => JSX.Element
}

const idExposeColumn = ({ renderCell, ...fields }: I_ColumnReplacement, idFieldName = 'id'): GridColDef => {
  return {
    ...fields,
    renderCell: (params) => (
      <>
        <Tooltip placement="left" title={`Id ${params.row[idFieldName]}`}>
          <Box>{renderCell ? renderCell(params) : params.value}</Box>
        </Tooltip>
      </>
    ),
  }
}
export { paginationModelAsFetchPaginationOptions, idExposeColumn }

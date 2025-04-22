import { DEFAULT_PAGE_SIZE } from '@/config'
import { alpha, styled } from '@mui/material'
import {
  DataGrid,
  DataGridProps,
  GridCallbackDetails,
  gridClasses,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid'
import { useState } from 'react'

const ODD_OPACITY = 0.2

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}))

type I_SelectedDataGridProps = Pick<
  DataGridProps,
  | 'checkboxSelection'
  | 'slots'
  | 'density'
  | 'rowSelectionModel'
  | 'onRowSelectionModelChange'
  | 'slotProps'
  | 'onRowClick'
  | 'disableRowSelectionOnClick'
>

interface I_Props extends I_SelectedDataGridProps {
  paginationModel: GridPaginationModel
  onPaginationModelChange:
    | ((model: GridPaginationModel, details: GridCallbackDetails<'pagination'>) => void)
    | undefined
  data?: DataGridProps['rows']
  count?: number
  columns: Array<GridColDef>
  isLoading?: boolean
}

function Table({ isLoading = false, data, count, ...props }: I_Props) {
  return (
    <StripedDataGrid
      sx={{ background: 'white', borderRadius: 3 }}
      rows={data}
      getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
      pageSizeOptions={[10, 25, 100]}
      paginationMode="server"
      loading={isLoading}
      rowCount={count || 0}
      {...props}
    />
  )
}

const usePaginationModel = (
  defaultValues = {
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  },
) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(defaultValues)
  return { paginationModel, setPaginationModel }
}

const useRowSelectionModel = () => {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  return { rowSelectionModel, setRowSelectionModel }
}
Table.usePaginationModel = usePaginationModel
Table.useRowSelectionModel = useRowSelectionModel

export default Table

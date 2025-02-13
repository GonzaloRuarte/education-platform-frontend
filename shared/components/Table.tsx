import { alpha, styled } from '@mui/material';
import { DataGrid, DataGridProps, GridCallbackDetails, gridClasses, GridColDef, GridPaginationModel } from '@mui/x-data-grid';



const ODD_OPACITY = 0.2;

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
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity,
      ),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
          theme.palette.action.selectedOpacity +
          theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}));

interface I_Props {
  paginationModel: GridPaginationModel
  onPaginationModelChange: ((model: GridPaginationModel, details: GridCallbackDetails<"pagination">) => void) | undefined
  data?: DataGridProps["rows"]
  count?: number
  columns: Array<GridColDef>
}

function Table({ paginationModel, onPaginationModelChange, data, count, columns }: I_Props) {
  return <StripedDataGrid
    rows={data} columns={columns}
    getRowClassName={(params) =>
      params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
    }
    paginationModel={paginationModel}
    pageSizeOptions={[10, 25, 100]}
    onPaginationModelChange={onPaginationModelChange}
    paginationMode='server'
    loading={data === undefined}
    rowCount={count || 0}
  />
}

export default Table
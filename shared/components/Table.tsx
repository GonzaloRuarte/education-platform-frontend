import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/config'
import { alpha, styled } from '@mui/material'
import {
  DataGrid,
  type DataGridProps,
  type GridCallbackDetails,
  gridClasses,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
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
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}))

/** SAFELY convert arbitrary HTML to its visible text (entities decoded, tags removed) */
export const stripHtmlToText = (html?: string) => {
  if (!html) return ''
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const div = document.createElement('div')
      div.innerHTML = html
      return (div.textContent || '').replace(/\s+/g, ' ').trim()
    }
  } catch {
    // ignore and fall back below
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Column factory for MUI Data Grid:
 * - Displays your HTML (via dangerouslySetInnerHTML)
 * - Exposes visible text as the logical value
 */
type HtmlTextColOpts = Omit<
  GridColDef,
  'field' | 'renderCell' | 'valueGetter' | 'sortComparator' | 'type'
> & {
  htmlField: string
  field: string
}

export const htmlTextColumn = ({
  htmlField,
  field,
  ...rest
}: HtmlTextColOpts): GridColDef => ({
  field,
  type: 'string',
  filterable: true,
  sortable: true,
  valueGetter: (_value, row) => stripHtmlToText(row?.[htmlField]),
  renderCell: (params) => (
    <span
      dangerouslySetInnerHTML={{ __html: String(params.row?.[htmlField] ?? '') }}
    />
  ),
  sortComparator: (a, b) =>
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  ...rest,
})

type I_Props = Omit<
  DataGridProps,
  | 'rows'
  | 'rowCount'
  | 'columns'
  | 'loading'
  | 'paginationModel'
  | 'onPaginationModelChange'
> & {
  paginationModel: GridPaginationModel
  onPaginationModelChange?: (
    model: GridPaginationModel,
    details: GridCallbackDetails<'pagination'>,
  ) => void
  data?: DataGridProps['rows']
  count?: number
  columns: Array<GridColDef>
  isLoading?: boolean
}

function Table({
  isLoading = false,
  data,
  count = 0,
  paginationModel,
  onPaginationModelChange,
  columns,

  // Good defaults for your custom-toolbar approach:
  disableColumnSorting = true,
  disableColumnFilter = true,
  ignoreDiacritics = true,

  ...props
}: I_Props) {
  const pageSizeOptions = Array.from(
    new Set([...PAGE_SIZE_OPTIONS, paginationModel.pageSize]),
  )

  return (
    <StripedDataGrid
      sx={{ background: 'white', borderRadius: 3 }}
      rows={data ?? []}
      rowCount={count}
      columns={columns}
      loading={isLoading}
      pagination
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={pageSizeOptions}
      paginationMode="server"
      sortingMode="server"
      filterMode="server"
      disableColumnSorting={disableColumnSorting}
      disableColumnFilter={disableColumnFilter}
      ignoreDiacritics={ignoreDiacritics}
      getRowClassName={(p) =>
        p.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      {...props}
    />
  )
}

const usePaginationModel = (initial?: Partial<GridPaginationModel>) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    ...initial,
  })
  return { paginationModel, setPaginationModel }
}

const useRowSelectionModel = () => {
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([])
  return { rowSelectionModel, setRowSelectionModel }
}

Table.usePaginationModel = usePaginationModel
Table.useRowSelectionModel = useRowSelectionModel

export default Table

/* ---------------------------
   Example of how to define columns with HTML rendering
   (put this next to where you build your columns)
--------------------------------
import { htmlTextColumn } from './Table'

const columns: GridColDef[] = [
  htmlTextColumn({
    field: 'description',
    htmlField: 'descriptionHtml',   // your payload key with HTML
    headerName: 'Description',
    flex: 1,
  }),
  // ...other columns
]
*/
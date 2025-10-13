import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/config'
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
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}))

/** SAFELY convert arbitrary HTML to its visible text (entities decoded, tags removed) */
export const stripHtmlToText = (html?: string) => {
  if (!html) return ''
  try {
    // Run in browser (preferred)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const div = document.createElement('div')
      div.innerHTML = html
      return (div.textContent || '').replace(/\s+/g, ' ').trim()
    }
  } catch {
    // ignore and fall back below
  }
  // SSR/fallback (rough): strip tags & collapse whitespace
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Column factory for MUI Data Grid:
 * - Displays your HTML (via dangerouslySetInnerHTML)
 * - Sorts/filters by the inner text extracted from that HTML
 *
 * Usage:
 *   columns: [
 *     htmlTextColumn({ field: 'description', htmlField: 'descriptionHtml', headerName: 'Description', flex: 1 }),
 *     ...
 *   ]
 */
type HtmlTextColOpts = Omit<GridColDef, 'field' | 'renderCell' | 'valueGetter' | 'sortComparator' | 'type'> & {
  /** key on the row holding the HTML string (e.g. 'descriptionHtml') */
  htmlField: string
  /** column id (can be same as htmlField) */
  field: string
}

export const htmlTextColumn = ({ htmlField, field, ...rest }: HtmlTextColOpts): GridColDef => ({
  field,
  type: 'string',
  filterable: true,
  sortable: true,

  // 1) Logical value used by sorting/filtering/quick-filter:
  valueGetter: (_value, row) => stripHtmlToText(row?.[htmlField]),

  // 2) Pretty display using your HTML:
  renderCell: (params) => (
    <span
      // IMPORTANT: sanitize first if content isn't fully trusted (e.g., DOMPurify)
      dangerouslySetInnerHTML={{ __html: String(params.row?.[htmlField] ?? '') }}
    />
  ),

  // Optional: stable, locale-aware comparator (handles "A2" < "A10")
  sortComparator: (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),

  ...rest,
})

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
  onPaginationModelChange?: (m: GridPaginationModel, d: GridCallbackDetails<'pagination'>) => void
  sortModel?: DataGridProps['sortModel']
  onSortModelChange?: DataGridProps['onSortModelChange']
  filterModel?: DataGridProps['filterModel']
  onFilterModelChange?: DataGridProps['onFilterModelChange']
  data?: DataGridProps['rows']
  count?: number
  columns: Array<GridColDef>
  isLoading?: boolean
}

function Table({ isLoading = false, data, count = 0, ...props }: I_Props) {
  return (
    <StripedDataGrid
      sx={{ background: 'white', borderRadius: 3 }}
      rows={data}
      rowCount={count}
      getRowClassName={(p) => (p.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      paginationMode="server"
      filterMode="server"
      sortingMode="server"
      loading={isLoading}
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

// Attach hooks for ergonomics
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
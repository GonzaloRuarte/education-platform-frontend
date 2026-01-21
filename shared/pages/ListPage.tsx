import React, { useEffect, useRef, useState } from 'react'
import type {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid'

import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_BatchDeletionServiceHook, T_ListServiceHook, T_VoidFn } from '@/shared/types'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import { useConfirm } from '@/shared/confirm'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'
import { EntityName } from '@/shared/utils'
import type { T_PageSizeOptions } from '@/config'
import { usePathname } from 'next/navigation'

// ----------------------------
// Cache types / config
// ----------------------------
type T_ListPageCache = {
  ts: number
  paginationModel: GridPaginationModel
  sortModel: GridSortModel
  filterModel: GridFilterModel
}

const LISTPAGE_TTL_MS = 3 * 60 * 1000 // 3 minutes

// ----------------------------
// Props
// ----------------------------
interface I_Props<T_Id, T_Response extends I_PaginatedResponse, T_Filters extends Record<string, any> = Record<string, any>> {
  columns: Array<GridColDef>
  useList: T_ListServiceHook<T_Response>
  entityName: EntityName
  onRowClick?: (params: GridRowParams) => void
  onCreate?: T_VoidFn
  useBatchDelete?: T_BatchDeletionServiceHook<T_Id>
  customButtons?: React.ReactNode
  filtersComponents?: React.ReactNode
  filtersData?: T_Filters
  singleSelectionButtons?: (id: T_Id) => React.ReactNode
  /** Initial page size (defaults to 100) */
  initialPageSize?: T_PageSizeOptions
  /**
   * Optional: use this to scope cache per "variant" of the same list (e.g. different external filters).
   * If omitted, we fall back to JSON.stringify(filtersData) best-effort.
   */
  stateKey?: string
}

// ----------------------------
// Batch Delete button
// ----------------------------
function BatchDeleteAction<T_Id>(p: {
  useBatchDelete: T_BatchDeletionServiceHook<T_Id>
  entityName: EntityName
  reload: T_VoidFn
  rowSelectionModel: GridRowSelectionModel
}) {
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const { entityName, reload, useBatchDelete, rowSelectionModel } = p
  const showDelete = rowSelectionModel.length > 0
  const batchDelete = useBatchDelete({ entityName, reload, showConfirm })

  const handleBatchDelete = () => {
    const ids = rowSelectionModel as Array<T_Id>
    batchDelete(ids)
  }

  if (!showDelete) return null

  return (
    <>
      <Button onClick={handleBatchDelete} startIcon={<DeleteIcon />} color="error">
        Eliminar
      </Button>
      <ConfirmDialogComponent />
    </>
  )
}

// ----------------------------
// List Page Component
// ----------------------------
function ListPage<T_Id, T_Response extends I_PaginatedResponse, T_Filters extends Record<string, any> = Record<string, any>>(p: I_Props<T_Id, T_Response, T_Filters>) {
  const pathname = usePathname()

  // Best-effort: if filtersData is stable/serializable, include it; otherwise use stateKey.
  const derivedStateKey = (() => {
    if (p.stateKey) return p.stateKey
    try {
      return JSON.stringify(p.filtersData ?? {})
    } catch {
      return 'nofilters'
    }
  })()

  const storageKey = `listpage:${pathname}:${p.entityName.plural}:${derivedStateKey}`

  // pagination & selection models from the Table hooks
  const { paginationModel, setPaginationModel } = Table.usePaginationModel({
    pageSize: p.initialPageSize ?? 100,
  })
  const { rowSelectionModel, setRowSelectionModel } = Table.useRowSelectionModel()

  // Enable selection if batch delete or single-selection buttons exist
  const enableRowSelection = p.useBatchDelete !== undefined || p.singleSelectionButtons !== undefined

  // Server-side sorting and filtering models
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] })

  const hydratedRef = useRef(false)

  // ✅ HYDRATE on mount + refresh TTL on access
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = sessionStorage.getItem(storageKey)

      if (raw) {
        const cached = JSON.parse(raw) as T_ListPageCache
        const isFresh = typeof cached?.ts === 'number' && Date.now() - cached.ts <= LISTPAGE_TTL_MS

        if (isFresh) {
          if (cached.paginationModel) setPaginationModel(cached.paginationModel)
          if (cached.sortModel) setSortModel(cached.sortModel)
          if (cached.filterModel) setFilterModel(cached.filterModel)

          // refresh TTL on access
          sessionStorage.setItem(storageKey, JSON.stringify({ ...cached, ts: Date.now() } satisfies T_ListPageCache))
        } else {
          sessionStorage.removeItem(storageKey)
        }
      }
    } catch {
      sessionStorage.removeItem(storageKey)
    } finally {
      hydratedRef.current = true
    }
  }, [storageKey, setPaginationModel])

  // ✅ PERSIST on changes (skip until hydrated)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hydratedRef.current) return

    const payload: T_ListPageCache = {
      ts: Date.now(),
      paginationModel,
      sortModel,
      filterModel,
    }
    sessionStorage.setItem(storageKey, JSON.stringify(payload))
  }, [storageKey, paginationModel, sortModel, filterModel])

  // ✅ reset to first page when user changes filters/sorts (not during hydrate)
  const handleSortModelChange = (m: GridSortModel) => {
    setSortModel(m)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleFilterModelChange = (m: GridFilterModel) => {
    setFilterModel(m)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  // Fetch paginated data from the server
  const { data, isLoading, reload } = p.useList({
    ...paginationModelAsFetchPaginationOptions(paginationModel), // { page, page_size }
    sort: sortModel,
    filters: filterModel,
    externalFilters: p.filtersData,
  })

  return (
    <Page>
      <Page.Title>Listado de {p.entityName.plural}</Page.Title>

      {/* Toolbar with buttons */}
      <Page.Toolbar>
        <Button onClick={reload} startIcon={<ReplayIcon />}>
          Actualizar
        </Button>

        {p.onCreate && (
          <Button onClick={p.onCreate} startIcon={<AddCircleIcon />}>
            Agregar
          </Button>
        )}

        {p.useBatchDelete && (
          <BatchDeleteAction
            reload={reload}
            rowSelectionModel={rowSelectionModel}
            entityName={p.entityName}
            useBatchDelete={p.useBatchDelete}
          />
        )}

        {rowSelectionModel.length === 1 &&
          p.singleSelectionButtons &&
          p.singleSelectionButtons(rowSelectionModel[0] as T_Id)}

        {p.customButtons}
      </Page.Toolbar>

      <Page.Toolbar>{p.filtersComponents}</Page.Toolbar>

      {/* The DataGrid */}
      <Page.Content>
        <Table
          data={data?.results}
          count={data?.count}
          columns={p.columns}
          isLoading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          onRowSelectionModelChange={setRowSelectionModel}
          rowSelectionModel={rowSelectionModel}
          checkboxSelection={enableRowSelection}
          disableRowSelectionOnClick
          onRowClick={p.onRowClick}
        />
      </Page.Content>
    </Page>
  )
}

// Helper to quickly attach navigation behavior
ListPage.mapNavToOnRowClick = (nav: (id: number | string) => void) => (params: GridRowParams<any>) => nav(params.id)

export default ListPage

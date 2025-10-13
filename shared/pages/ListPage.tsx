import React, { useState, useEffect } from 'react'
import type {
  GridColDef,
  GridFilterModel,
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
// ----------------------------
// Props
// ----------------------------
interface I_Props<T_Id, T_Response extends I_PaginatedResponse, T_Filters = object> {
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
function ListPage<T_Id, T_Response extends I_PaginatedResponse>(p: I_Props<T_Id, T_Response>) {
  // pagination & selection models from the Table hooks
  const { paginationModel, setPaginationModel } = Table.usePaginationModel()
  const { rowSelectionModel, setRowSelectionModel } = Table.useRowSelectionModel()

  // Enable selection if batch delete or single-selection buttons exist
  const enableRowSelection = p.useBatchDelete !== undefined || p.singleSelectionButtons !== undefined

  // Server-side sorting and filtering models
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] })

  // Reset to first page on filter/sort changes
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [JSON.stringify(filterModel), JSON.stringify(sortModel)])

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
          onSortModelChange={setSortModel}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
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

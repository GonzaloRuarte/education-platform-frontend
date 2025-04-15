import { DEFAULT_PAGE_SIZE } from '@/config'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_BatchDeletionServiceHook, T_ListServiceHookV2, T_VoidFn } from '@/shared/types'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import { GridColDef, GridPaginationModel, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid'

import { useConfirm } from '@/shared/confirm'
import { successToast } from '@/shared/toasts'
import { EntityName, sentence } from '@/shared/utils'
import { ComponentProps, FC, useState } from 'react'

interface I_Props<T_Id, T_Response> {
  columns: Array<GridColDef>
  useList: T_ListServiceHookV2<T_Response>
  entityName: EntityName
  onRowClick?: ComponentProps<typeof Table>['onRowClick']
  onCreate?: T_VoidFn
  useBatchDelete?: T_BatchDeletionServiceHook<T_Id>
}

function BatchDeleteAction<T_Id>(p: {
  useBatchDelete: T_BatchDeletionServiceHook<T_Id>
  entityName: EntityName
  reload: T_VoidFn
  rowSelectionModel: GridRowSelectionModel
}) {
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const { entityName, reload, useBatchDelete, rowSelectionModel } = p
  const showDelete = rowSelectionModel.length > 0
  const batchDelete = useBatchDelete({ entityName: entityName, reload, showConfirm })

  const handleBatchDelete = () => {
    const ids = rowSelectionModel as Array<T_Id>
    batchDelete(ids)
  }

  if (!showDelete) return <></>

  return (
    <>
      <Button onClick={handleBatchDelete} startIcon={<DeleteIcon />}>
        Eliminar
      </Button>
      <ConfirmDialogComponent />
    </>
  )
}
function ListPage<T_Id, T_Response extends I_PaginatedResponse>(p: I_Props<T_Id, T_Response>) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  })
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

  const { data, isLoading, reload } = p.useList({ page: paginationModel.page + 1, page_size: paginationModel.pageSize })

  return (
    <>
      <Page>
        <Page.Title>Listado de {p.entityName.plural}</Page.Title>
        <Page.Toolbar>
          <Button onClick={reload} startIcon={<ReplayIcon />}>
            Actualizar
          </Button>
          {p.onCreate !== undefined && (
            <Button onClick={p.onCreate} startIcon={<AddCircleIcon />}>
              Agregar
            </Button>
          )}
          {p.useBatchDelete !== undefined && (
            <BatchDeleteAction
              {...{ reload, rowSelectionModel }}
              entityName={p.entityName}
              useBatchDelete={p.useBatchDelete}
            />
          )}
        </Page.Toolbar>
        <Page.Content>
          <Table
            data={data?.results}
            columns={p.columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onRowSelectionModelChange={setRowSelectionModel}
            rowSelectionModel={rowSelectionModel}
            count={data?.count}
            isLoading={isLoading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={p.onRowClick}
          />
        </Page.Content>
      </Page>
    </>
  )
}

// const CustomToolbar = ({ rowSelectionModel }: GridToolbarProps & { rowSelectionModel: GridRowSelectionModel }) => {
//   return (
//     <GridToolbarContainer>
//       {/*
//       <GridToolbarDensitySelector /> */}
//       {/* <Box sx={{ flexGrow: 1 }} /> */}
//       {/* <GridToolbarExport /> */}
//     </GridToolbarContainer>
//   )
// }

ListPage.mapNavToOnRowClick = (nav: (id: number | string) => void) => (params: GridRowParams<any>) => nav(params.id)

export default ListPage

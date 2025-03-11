import { DEFAULT_PAGE_SIZE } from '@/config'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_ListServiceHookV2 } from '@/shared/types'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import { GridColDef, GridPaginationModel, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid'

import { useConfirm } from '@/shared/confirm'
import { successToast } from '@/shared/toasts'
import { EntityName } from '@/shared/utils'
import { ComponentProps, useState } from 'react'

interface I_Props<T_Response> {
  columns: Array<GridColDef>
  useList: T_ListServiceHookV2<T_Response>
  entityName: EntityName
  onRowClick?: ComponentProps<typeof Table>['onRowClick']
  onCreate?: () => void
  onBatchDelete?: (ids: Array<number | string>) => Promise<any>
}
function ListPage<T_Response extends I_PaginatedResponse>(p: I_Props<T_Response>) {
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  })
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const showDelete = rowSelectionModel.length > 0
  const { data, isLoading, reload } = p.useList({ page: paginationModel.page + 1, page_size: paginationModel.pageSize })

  const handleBatchDelete = () => {
    const ids = rowSelectionModel as Array<number>

    showConfirm(`Eliminar ${p.entityName.plural} ${ids}`, '¿Estás seguro/a que querés proceder?').then(() => {
      if (p.onBatchDelete === undefined) return
      p.onBatchDelete(ids)
        .then(() => {
          successToast('Escuelas eliminadas correctamente.')
        })
        .finally(reload)
    })
  }

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
          {showDelete && (
            <Button onClick={handleBatchDelete} startIcon={<DeleteIcon />}>
              Eliminar
            </Button>
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
      <ConfirmDialogComponent />
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

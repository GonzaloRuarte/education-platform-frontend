import { DEFAULT_PAGE_SIZE } from '@/config'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { useInProgressLocal } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { T_ListServiceHook } from '@/shared/types'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import {
  GridColDef,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarProps,
} from '@mui/x-data-grid'

import { useConfirm } from '@/shared/confirm'
import { successToast } from '@/shared/toasts'
import debounce from 'debounce'
import { ComponentProps, useEffect, useState } from 'react'

interface I_Props<T_Response> {
  columns: Array<GridColDef>

  useService: T_ListServiceHook<T_Response>
  title: string
  onRowClick?: ComponentProps<typeof Table>['onRowClick']
  onCreate?: () => void
  onBatchDelete?: (ids: Array<number | string>) => Promise<any>
}
function ListPage<T_Response extends I_PaginatedResponse>(p: I_Props<T_Response>) {
  const { isInProgress, setIsInProgress } = useInProgressLocal()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const fetchingService = p.useService()

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  })
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const showDelete = rowSelectionModel.length > 0

  const [data, setData] = useState<T_Response | undefined>(undefined)

  const handleBatchDelete = () => {
    const ids = rowSelectionModel as Array<number>

    showConfirm(`Eliminar escuelas ${ids}`, '¿Estás seguro/a que querés eliminar estas Escuelas?').then(() => {
      if (p.onBatchDelete === undefined) return
      p.onBatchDelete(ids)
        .then(() => {
          successToast('Escuelas eliminadas correctamente.')
        })
        .finally(fetchData)
    })
  }

  const fetchData = () => {
    log.info('fetching data')
    setIsInProgress(true)
    fetchingService({ page: paginationModel.page + 1, page_size: paginationModel.pageSize })
      .then((res) => {
        setData(res)
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }

  useEffect(debounce(fetchData), [paginationModel])

  return (
    <>
      <Page>
        <Page.Title>{p.title}</Page.Title>
        <Page.Toolbar>
          <Button onClick={fetchData} startIcon={<ReplayIcon />}>
            Actualizar
          </Button>
          <Button onClick={p.onCreate} startIcon={<AddCircleIcon />}>
            Agregar
          </Button>
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
            isLoading={isInProgress}
            checkboxSelection
            disableRowSelectionOnClick
            // slots={{
            //   toolbar: CustomToolbar,
            // }}

            onRowClick={p.onRowClick}
          />
        </Page.Content>
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

const CustomToolbar = ({ rowSelectionModel }: GridToolbarProps & { rowSelectionModel: GridRowSelectionModel }) => {
  return (
    <GridToolbarContainer>
      {/* 
      <GridToolbarDensitySelector /> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}
      {/* <GridToolbarExport /> */}
    </GridToolbarContainer>
  )
}

ListPage.mapNavToOnRowClick = (nav: (id: number | string) => void) => (params: GridRowParams<any>) => nav(params.id)

export default ListPage

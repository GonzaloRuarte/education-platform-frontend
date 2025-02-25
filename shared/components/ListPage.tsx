import { DEFAULT_PAGE_SIZE } from '@/config'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { T_ServiceHook } from '@/shared/types'
import {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarProps,
} from '@mui/x-data-grid'
import debounce from 'debounce'
import { useEffect, useState } from 'react'

interface I_Props<T_Response> {
  columns: Array<GridColDef>

  useService: T_ServiceHook<T_Response>
  title: string
}
function ListPage<T_Response extends I_PaginatedResponse>(p: I_Props<T_Response>) {
  const { isInProgress, setIsInProgress } = useInProgress()
  const fetchingService = p.useService()

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  })
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

  const [data, setData] = useState<T_Response | undefined>(undefined)

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
    <Page>
      <Page.Title>{p.title}</Page.Title>
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
          slots={{
            toolbar: CustomToolbar,
          }}
          // @ts-expect-error
          slotProps={{ toolbar: { rowSelectionModel } }}
        />
      </Page.Content>
    </Page>
  )
}

const CustomToolbar = ({ rowSelectionModel }: GridToolbarProps & { rowSelectionModel: GridRowSelectionModel }) => {
  return (
    <GridToolbarContainer>
      {/* <GridToolbarQuickFilter />
      <GridToolbarDensitySelector /> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}
      {/* <GridToolbarExport /> */}
    </GridToolbarContainer>
  )
}

export default ListPage

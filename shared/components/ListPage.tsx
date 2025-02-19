import { DEFAULT_PAGE_SIZE } from '@/config';
import Page from '@/shared/components/Page';
import Table from '@/shared/components/Table';
import { I_PaginatedResponse } from '@/shared/data/types';
import { handleServiceError, I_FetchOptions } from '@/shared/service';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useEffect, useState } from 'react';
import debounce from 'debounce'
import useToasts from '@/shared/toasts';
import { useInProgress } from '@/shared/hooks';
import log from '@/shared/log';

interface I_Props<T_Response> {
  columns: Array<GridColDef>
  fetchingService: (options: I_FetchOptions) => Promise<T_Response>
  title: string
}
function ListPage<T_Response extends I_PaginatedResponse>(p: I_Props<T_Response>) {
  const { isInProgress, setIsInProgress } = useInProgress()

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  });


  const [data, setData] = useState<T_Response | undefined>(undefined)

  const fetchData = () => {
    log.info("fetching data")
    setIsInProgress(true)
    p.fetchingService({ page: paginationModel.page + 1, page_size: paginationModel.pageSize })
      .then(res => {
        setData(res);
      })
      .catch(handleServiceError)
      .finally(() => { setIsInProgress(false) })
  }


  useEffect(fetchData, [paginationModel])

  return <Page>
    <Page.Title>{p.title}</Page.Title>
    <Page.Content>
      <Table
        data={data?.results}
        columns={p.columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        count={data?.count}
        isLoading={isInProgress}
      />
    </Page.Content>
  </Page>
}

export default ListPage
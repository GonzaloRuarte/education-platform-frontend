import { DEFAULT_PAGE_SIZE } from '@/config';
import Page from '@/shared/components/Page';
import Table from '@/shared/components/Table';
import { I_PaginatedResponse } from '@/shared/data/types';
import { I_FetchOptions } from '@/shared/service';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useEffect, useState } from 'react';

interface I_Props<T_Response> {
  columns: Array<GridColDef>
  fetchingService: (options: I_FetchOptions) => Promise<T_Response>
  title: string
}
function ListPage<T_Response extends I_PaginatedResponse>(p: I_Props<T_Response>) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: 0,
  });

  const [data, setData] = useState<T_Response | undefined>(undefined)

  useEffect(() => {
    p.fetchingService({ page: paginationModel.page + 1, page_size: paginationModel.pageSize })
      .then(res => {
        setData(res);
      })
  }, [paginationModel])
  return <Page>
    <Page.Title>{p.title}</Page.Title>
    <Page.Content>
      <Table
        data={data?.results}
        columns={p.columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        count={data?.count}
      />
    </Page.Content>
  </Page>
}

export default ListPage
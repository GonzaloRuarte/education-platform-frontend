"use client"

import { schoolsList } from '@/mta_schools/services'
import { T_GetSchoolsListResponse } from '@/mta_schools/types'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import React, { useEffect } from 'react'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Nombre', flex: 2 },
  { field: 'district', headerName: 'Distrito', flex: 1 },
  { field: 'contact_email', headerName: 'Contacto', flex: 1 },
]


const SchoolsListPage = () => {
  const [pm, setPm] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [data, setData] = React.useState<T_GetSchoolsListResponse | undefined>(undefined)

  useEffect(() => {
    schoolsList({ page: pm.page + 1, page_size: pm.pageSize })
      .then(res => {
        setData(res);
      })
  }, [pm])

  return <Page>
    <Page.Title>Escuelas</Page.Title>
    <Page.Content>
      <Table
        data={data?.results} columns={columns}
        paginationModel={pm}
        onPaginationModelChange={setPm}
        count={data?.count}
      />
    </Page.Content>
  </Page>
}

export default SchoolsListPage

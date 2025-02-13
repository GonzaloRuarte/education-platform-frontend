"use client"

import CohortLevelChip from '@/mta_schools/components/CohortLevelChip'
import { cohortsList } from '@/mta_schools/services'
import { T_GetCohortsListResponse } from '@/mta_schools/types'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import React, { useEffect } from 'react'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'school', headerName: 'Escuela', flex: 2, renderCell: ({ value }) => <>{value.name}</> },
  { field: 'level', headerName: 'Nivel', flex: 1, renderCell: ({ value }) => <CohortLevelChip level={value} /> },
  { field: 'grade', headerName: 'Grado/Año', flex: 1, renderCell: ({ value }) => <>{value}º</> },
  { field: 'name', headerName: 'Nombre', flex: 1 },
]



const CohortsListPage = () => {
  const [pm, setPm] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [data, setData] = React.useState<T_GetCohortsListResponse | undefined>(undefined)

  useEffect(() => {
    cohortsList({ page: pm.page + 1, page_size: pm.pageSize })
      .then(res => {
        setData(res);
      })
  }, [pm])

  return <Page>
    <Page.Title>Divisiones</Page.Title>
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

export default CohortsListPage

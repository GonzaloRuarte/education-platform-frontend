"use client"

import { studentProfileList } from '@/mta_schools/services'
import { T_GetStudentProfileListResponse } from '@/mta_schools/types'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import React, { useEffect } from 'react'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'personal_id', headerName: 'DNI', flex: 1 },
  { field: 'school', headerName: 'Escuela', flex: 2 },
  { field: 'cohort', headerName: 'División', flex: 2, renderCell: ({ value }) => <>{value.name}</> },
]


const StudentProfileListPage = () => {
  const [pm, setPm] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [data, setData] = React.useState<T_GetStudentProfileListResponse | undefined>(undefined)

  useEffect(() => {
    studentProfileList({ page: pm.page + 1, page_size: pm.pageSize })
      .then(res => {
        setData(res);
      })
  }, [pm])

  return <Page>
    <Page.Title>Estudiantes</Page.Title>
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

export default StudentProfileListPage

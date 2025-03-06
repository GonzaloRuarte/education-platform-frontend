'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useNavigateToSchoolCreate, useNavigateToSchoolDetail, useSchoolBatchDelete, useSchoolList } from '@/mta_schools/hooks'
import ListPage from '@/shared/pages/ListPage'
import { Chip } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Nombre', flex: 1.5 },
  { field: 'district', headerName: 'Distrito', flex: 1 },
  {
    field: 'staff',
    headerName: 'Staff',
    flex: 1.5,
    renderCell: ({ value }) => {
      if (value.length === 0) return <>-</>
      const FinalChip = () => <Chip size="small" key={value[0].user_id} label={value[0].full_name} />
      if (value.length === 1) return <FinalChip />
      return (
        <>
          <FinalChip /> <Chip size="small" label={`y ${value.length - 1} más`} />
        </>
      )
    },
  },
  { field: 'contact_email', headerName: 'Contacto', flex: 1 },
]

const SchoolsListPage = () => {
  const navigateToSchoolDetail = useNavigateToSchoolDetail()
  const navigateToSchoolCreate = useNavigateToSchoolCreate()
  const schoolBatchDelete = useSchoolBatchDelete()
  return (
    <ListPage
      columns={columns}
      useList={useSchoolList}
      title="Escuelas"
      onRowClick={ListPage.mapNavToOnRowClick(navigateToSchoolDetail)}
      onCreate={navigateToSchoolCreate}
      onBatchDelete={schoolBatchDelete}
    />
  )
}

export default withAuth(SchoolsListPage, ['admin', 'school_staff'])

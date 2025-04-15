'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useNavigateToSchoolCreate, useNavigateToSchoolDetail, useSchoolBatchDelete } from '@/mta_schools/hooks'
import { USER_NAME } from '@/mta_users/constants'
import { useUserList } from '@/mta_users/hooks'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'username', headerName: 'Nombre de usuario', flex: 1.5 },
  { field: 'email', headerName: 'E-Mail', flex: 1 },
  { field: 'is_active', headerName: '¿Está activo?', flex: 1, type: 'boolean' },
]

const UsersListPage = () => {
  const navigateToSchoolDetail = useNavigateToSchoolDetail()
  const navigateToSchoolCreate = useNavigateToSchoolCreate()

  return (
    <ListPage
      columns={columns}
      useList={useUserList}
      entityName={USER_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToSchoolDetail)}
      onCreate={navigateToSchoolCreate}
      useBatchDelete={useSchoolBatchDelete}
    />
  )
}

export default withAuth(UsersListPage, ['admin', 'school_staff'])

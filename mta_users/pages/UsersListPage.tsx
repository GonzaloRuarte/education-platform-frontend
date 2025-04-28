'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useNavigateToSchoolCreate, useNavigateToSchoolDetail, useSchoolBatchDelete } from '@/mta_schools/hooks'
import UserProfileChip from '@/mta_users/components/UserProfileChip'
import { USER_NAME } from '@/mta_users/constants'
import { useUserList } from '@/mta_users/hooks'
import { I_UserListItemWithProfiles } from '@/mta_users/types'
import ListPage from '@/shared/pages/ListPage'
import { Box } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_UserListItemWithProfiles>> = [
  { field: 'id', headerName: '#' },
  { field: 'username', headerName: 'Nombre de usuario', flex: 1 },
  { field: 'email', headerName: 'E-Mail', flex: 1 },
  { field: 'is_active', headerName: 'Activo', flex: 0.5, type: 'boolean' },

  {
    field: 'profiles',
    headerName: 'Roles',
    flex: 1.5,
    type: 'custom',
    renderCell: (params) => {
      return (
        <>
          <Box
            display={'inline-flex'}
            gap={1}
            justifyContent={'center'}
            alignItems={'center'}
            flexWrap={'nowrap'}
            margin={0}
          >
            {params.row.profiles
              .filter((p) => p !== null)
              .map((p) => (
                <UserProfileChip key={`${params.row.id}-${p}`} profile={p} size="small" variant="outlined" />
              ))}
          </Box>
        </>
      )
    },
  },
]

const UsersListPage = () => {
  const navigateToSchoolDetail = useNavigateToSchoolDetail()
  const navigateToSchoolCreate = useNavigateToSchoolCreate()

  return (
    <ListPage
      columns={columns}
      useList={useUserList}
      entityName={USER_NAME}
      // onRowClick={ListPage.mapNavToOnRowClick(navigateToSchoolDetail)}
      onCreate={navigateToSchoolCreate}
      useBatchDelete={useSchoolBatchDelete}
    />
  )
}

export default withAuth(UsersListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

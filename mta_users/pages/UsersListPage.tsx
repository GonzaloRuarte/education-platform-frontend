'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import UserProfileChip from '@/mta_users/components/UserProfileChip'
import { USER_NAME } from '@/mta_users/constants'
import { useNavigateToUserChangePassword, useUserBatchDelete, useUserList } from '@/mta_users/hooks'
import { I_UserListItemWithProfiles } from '@/mta_users/types'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import { Box } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import PasswordIcon from '@mui/icons-material/Password'
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
  const navigateToChangePassword = useNavigateToUserChangePassword()
  return (
    <ListPage
      columns={columns}
      useList={useUserList}
      entityName={USER_NAME}
      useBatchDelete={useUserBatchDelete}
      singleSelectionButtons={(id) => (
        <>
          <Button startIcon={<PasswordIcon />} onClick={() => navigateToChangePassword({ userId: id })}>
            Cambiar Password
          </Button>
        </>
      )}
    />
  )
}

export default withAuth(UsersListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

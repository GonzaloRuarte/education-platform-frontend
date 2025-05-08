'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import UserProfileChip from '@/mta_users/components/UserProfileChip'
import { useUserListFilters } from '@/mta_users/components/UsersListFiltersControl'
import { USER_NAME } from '@/mta_users/constants'
import { useNavigateToUserChangePassword, useUserBatchDelete, useUserList } from '@/mta_users/hooks'
import { I_UserListItemWithProfiles } from '@/mta_users/types'
import { ChangePasswordButton } from '@/shared/components/buttons'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { Box } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_UserListItemWithProfiles>> = [
  idExposeColumn({ field: 'username', headerName: 'Nombre de usuario', flex: 1 }),
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
  const { UsersListFiltersControl, filters, setFilters } = useUserListFilters()

  return (
    <ListPage
      columns={columns}
      useList={useUserList}
      entityName={USER_NAME}
      useBatchDelete={useUserBatchDelete}
      singleSelectionButtons={(id) => (
        <>
          <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: id })} />
        </>
      )}
      filtersData={filters}
      filtersComponents={<UsersListFiltersControl filters={filters} setFilters={setFilters} />}
    />
  )
}

export default withAuth(UsersListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

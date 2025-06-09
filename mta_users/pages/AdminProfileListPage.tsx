'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { I_SchoolStaffProfileListItem} from '@/mta_schools/types'
import { ADMIN_PROFILE_NAME } from '@/mta_users/constants'
import {
  useAdminProfileList,
  useNavigateToAdminProfileCreate,
  useNavigateToAdminProfileDetail,
} from '@/mta_users/hooks'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const columns: Array<GridColDef<I_SchoolStaffProfileListItem>> = [
  idExposeColumn({ field: 'username', headerName: 'Nombre de usuario', flex: 1 }),
  { field: 'email', headerName: 'E-Mail', flex: 1 },
  { field: 'is_active', headerName: 'Activo', flex: 0.5, type: 'boolean' },
]

const AdminProfileListPage = () => {
  const navToDetail = useNavigateToAdminProfileDetail()
  const navToCreate = useNavigateToAdminProfileCreate()

  return (
    <ListPage
      columns={columns}
      useList={useAdminProfileList}
      entityName={ADMIN_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
    />
  )
}

export default withAuth(AdminProfileListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})

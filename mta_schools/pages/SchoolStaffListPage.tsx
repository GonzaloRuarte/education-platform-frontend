'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolStaffProfileCreate,
  useNavigateToSchoolStaffProfileDetail,
  useSchoolStaffProfileBatchDelete,
  useSchoolStaffProfileList,
} from '@/mta_schools/hooks'
import { I_SchoolStaffProfileListItem } from '@/mta_schools/types'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const columns: Array<GridColDef<I_SchoolStaffProfileListItem>> = [
  idExposeColumn({ field: 'username', headerName: 'Usuario', flex: 1.5 }),
  { field: 'school_name', headerName: 'Escuela', flex: 1.5 },
  { field: 'email', headerName: 'Email', flex: 1.5 },
  { field: 'position', headerName: 'Cargo', flex: 1.5 },
  { field: 'institutional_telephone', headerName: 'Teléfono institucional', flex: 1.5 },
  { field: 'cellphone', headerName: 'Celular', flex: 1.5 },
]

const SchoolStaffProfileListPage = () => {
  const navToDetail = useNavigateToSchoolStaffProfileDetail()
  const navToCreate = useNavigateToSchoolStaffProfileCreate()

  return (
    <ListPage
      columns={columns}
      useList={useSchoolStaffProfileList}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useSchoolStaffProfileBatchDelete}
    />
  )
}

export default withAuth(SchoolStaffProfileListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})

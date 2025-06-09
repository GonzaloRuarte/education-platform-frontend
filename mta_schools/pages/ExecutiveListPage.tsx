'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EXECUTIVE_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToExecutiveProfileCreate,
  useNavigateToExecutiveProfileDetail,
  useExecutiveProfileBatchDelete,
  useExecutiveProfileList,
} from '@/mta_schools/hooks'
import { I_ExecutiveProfileListItem } from '@/mta_schools/types'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const columns: Array<GridColDef<I_ExecutiveProfileListItem>> = [
  idExposeColumn({ field: 'username', headerName: 'Usuario', flex: 1.5 }),
  { field: 'school_name', headerName: 'Escuela', flex: 1.5 },
  { field: 'email', headerName: 'Email', flex: 1.5 },
]

const ExecutiveProfileListPage = () => {
  const navToDetail = useNavigateToExecutiveProfileDetail()
  const navToCreate = useNavigateToExecutiveProfileCreate()

  return (
    <ListPage
      columns={columns}
      useList={useExecutiveProfileList}
      entityName={EXECUTIVE_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useExecutiveProfileBatchDelete}
    />
  )
}

export default withAuth(ExecutiveProfileListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})

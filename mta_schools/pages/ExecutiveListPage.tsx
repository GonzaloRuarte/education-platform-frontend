'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { EXECUTIVE_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToExecutiveProfileCreate,
  useNavigateToExecutiveProfileDetail,
  useExecutiveProfileBatchDelete,
  useExecutiveProfileList,
  useExecutiveProfileListByUserSchool,
} from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import { I_ExecutiveProfileListItem } from '@/mta_schools/types'
import Spinner from '@/shared/components/Spinner'
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
  const canManageSchools = useHasCapabilities(['manage_schools'])
  const { selectedSchool, isLoading } = useSchoolScopeResources()

  if (isLoading) return <Spinner />

  return (
    <ListPage
      columns={columns}
      useList={canManageSchools ? useExecutiveProfileList : useExecutiveProfileListByUserSchool}
      entityName={EXECUTIVE_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useExecutiveProfileBatchDelete}
      filtersData={!canManageSchools && selectedSchool !== undefined && selectedSchool !== null ? { school_id: selectedSchool.id } : undefined}
      stateKey={!canManageSchools && selectedSchool !== undefined && selectedSchool !== null ? `school-${selectedSchool.id}` : undefined}
    />
  )
}

export default withAuth(ExecutiveProfileListPage, {
  allowedCapabilities: ['manage_executives'],
  logoutDestination: 'dashboard',
})

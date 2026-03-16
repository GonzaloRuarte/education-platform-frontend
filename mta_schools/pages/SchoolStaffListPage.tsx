'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolStaffProfileCreate,
  useNavigateToSchoolStaffProfileDetail,
  useSchoolStaffProfileBatchDelete,
  useSchoolStaffProfileList,
  useSchoolStaffProfileListByUserSchool,
} from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
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
  const canManageSchools = useHasCapabilities(['manage_schools'])
  const { selectedSchool, isLoading } = useSchoolScopeResources()
  const useListHook = canManageSchools ? useSchoolStaffProfileList : useSchoolStaffProfileListByUserSchool

  return (
    <ListPage
      columns={columns}
      useList={useListHook}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useSchoolStaffProfileBatchDelete}
      filtersData={!canManageSchools && !isLoading && selectedSchool !== undefined && selectedSchool !== null ? { school_id: selectedSchool.id } : undefined}
      stateKey={!canManageSchools && !isLoading && selectedSchool !== undefined && selectedSchool !== null ? `school-${selectedSchool.id}` : undefined}
    />
  )
}

export default withAuth(SchoolStaffProfileListPage, {
  allowedCapabilities: ['manage_school_staff'],
  logoutDestination: 'dashboard',
})

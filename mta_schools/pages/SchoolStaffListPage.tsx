'use client'

import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import { useSchoolStaffProfileList } from '@/mta_schools/hooks'
import { I_SchoolStaffProfileListItem } from '@/mta_schools/types'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const columns: Array<GridColDef<I_SchoolStaffProfileListItem>> = [
  // { field: 'id', headerName: '#' },
  { field: 'username', headerName: 'Usuario', flex: 1.5 },
  { field: 'school_name', headerName: 'Escuela', flex: 1.5 },
  { field: 'email', headerName: 'Email', flex: 1.5 },
]

const SchoolStaffProfileListPage = () => {
  // const navigateToSchoolDetail = useNavigateToSchoolDetail()
  // const navigateToSchoolCreate = useNavigateToSchoolCreate()

  return (
    <ListPage
      columns={columns}
      useList={useSchoolStaffProfileList}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      // onRowClick={ListPage.mapNavToOnRowClick(navigateToSchoolDetail)}
      // onCreate={navigateToSchoolCreate}
      // useBatchDelete={useSchoolBatchDelete}
    />
  )
}

export default SchoolStaffProfileListPage

'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToStudentProfileBatchCreate,
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useStudentProfileBatchDelete,
  useStudentProfileList,
  useStudentProfileListBySchool,
} from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import { T_SchoolId } from '@/mta_schools/types'
import Button from '@/shared/components/Button'
import Spinner from '@/shared/components/Spinner'
import { I_FetchOptions } from '@/shared/data/types'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const baseColumns: Array<GridColDef> = [
  { field: 'id', headerName: 'ID', flex: 1 },
  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    renderCell: ({ value }) => <>{value.name}</>,
  },
  { field: 'cohort', headerName: 'División', flex: 2 },
]

const studentProfileListBySchool_CurrifiedHook = (schoolId: T_SchoolId) => (options?: I_FetchOptions) => {
  return useStudentProfileListBySchool(options, { schoolId })
}

const StudentProfileListPage = () => {
  const navigateToDetail = useNavigateToStudentProfileDetail()
  const navigateToCreate = useNavigateToStudentProfileCreate()
  const navigateToBatchCreate = useNavigateToStudentProfileBatchCreate()
  const canManageSchools = useHasCapabilities(['manage_schools'])
  const canViewStudentDni = useHasCapabilities(['view_student_dni'])
  const { isLoading, selectedSchool } = useSchoolScopeResources()

  if (isLoading || selectedSchool === undefined) return <Spinner />

  const columns = canViewStudentDni
    ? ([
        { field: 'personal_id', headerName: 'DNI', flex: 1 },
        ...baseColumns,
      ] as Array<GridColDef>)
    : baseColumns

  const useListHook =
    !canManageSchools && selectedSchool !== null ? studentProfileListBySchool_CurrifiedHook(selectedSchool.id) : useStudentProfileList

  return (
    <ListPage
      columns={columns}
      useList={useListHook}
      entityName={STUDENT_PROFILE_NAME}
      onCreate={navigateToCreate}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
      useBatchDelete={useStudentProfileBatchDelete}
      customButtons={<Button onClick={navigateToBatchCreate}>Carga masiva</Button>}
    />
  )
}

export default withAuth(StudentProfileListPage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})

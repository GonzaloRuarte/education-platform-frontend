'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToStudentProfileBatchCreate,
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useStudentProfileBatchDelete,
  useStudentProfileList,
  useStudentProfileListBySchool,
} from '@/mta_schools/hooks'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'
import { T_SchoolId } from '@/mta_schools/types'
import Button from '@/shared/components/Button'
import Spinner from '@/shared/components/Spinner'
import { I_FetchOptions } from '@/shared/data/types'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'personal_id', headerName: 'DNI', flex: 1 }),
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
  const { isAdmin } = useUserProfilesResources()
  const ownSchool = useSchoolOwnSchool()

  if (ownSchool === undefined) return <Spinner />

  return (
    <ListPage
      columns={columns}
      useList={
        !isAdmin && ownSchool !== null ? studentProfileListBySchool_CurrifiedHook(ownSchool.id) : useStudentProfileList
      }
      entityName={STUDENT_PROFILE_NAME}
      onCreate={navigateToCreate}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
      useBatchDelete={useStudentProfileBatchDelete}
      customButtons={
        <>
          <Button onClick={navigateToBatchCreate}>Carga masiva</Button>
        </>
      }
    />
  )
}

export default withAuth(StudentProfileListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

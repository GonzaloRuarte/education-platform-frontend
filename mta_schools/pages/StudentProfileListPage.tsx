'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useStudentProfileList,
} from '@/mta_schools/hooks'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'personal_id', headerName: 'DNI', flex: 1 },
  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    renderCell: ({ value }) => <>{value.name}</>,
  },
  { field: 'cohort', headerName: 'División', flex: 2 },
]

const StudentProfileListPage = () => {
  const navigateToDetail = useNavigateToStudentProfileDetail()
  const navigateToCreate = useNavigateToStudentProfileCreate()
  return (
    <ListPage
      columns={columns}
      useList={useStudentProfileList}
      entityName={STUDENT_PROFILE_NAME}
      onCreate={navigateToCreate}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
    />
  )
}

export default withAuth(StudentProfileListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

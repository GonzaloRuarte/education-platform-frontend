'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useStudentProfileList } from '@/mta_schools/hooks'
import ListPage from '@/shared/components/ListPage'
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

const StudentProfileListPage = () => (
  <ListPage
    columns={columns}
    useService={useStudentProfileList}
    title="Estudiantes"
  />
)

export default withAuth(StudentProfileListPage, ['admin', 'school_staff'])

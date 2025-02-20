"use client"

import { useStudentProfileList } from '@/mta_schools/hooks'
import ListPage from '@/shared/components/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'personal_id', headerName: 'DNI', flex: 1 },
  { field: 'school', headerName: 'Escuela', flex: 2 },
  { field: 'cohort', headerName: 'División', flex: 2, renderCell: ({ value }) => <>{value.name}</> },
]

const StudentProfileListPage = () => <ListPage columns={columns} useService={useStudentProfileList} title='Estudiantes' />

export default StudentProfileListPage

"use client"

import { studentProfileList } from '@/mta_schools/services'
import ListPage from '@/shared/components/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'personal_id', headerName: 'DNI', flex: 1 },
  { field: 'school', headerName: 'Escuela', flex: 2 },
  { field: 'cohort', headerName: 'División', flex: 2, renderCell: ({ value }) => <>{value.name}</> },
]


const StudentProfileListPage = () => <ListPage columns={columns} fetchingService={studentProfileList} title='Estudiantes' />

export default StudentProfileListPage

"use client"

import CohortLevelChip from '@/mta_schools/components/CohortLevelChip'
import { cohortsList } from '@/mta_schools/services'
import ListPage from '@/shared/components/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'school', headerName: 'Escuela', flex: 2, renderCell: ({ value }) => <>{value.name}</> },
  { field: 'level', headerName: 'Nivel', flex: 1, renderCell: ({ value }) => <CohortLevelChip level={value} /> },
  { field: 'grade', headerName: 'Grado/Año', flex: 1, renderCell: ({ value }) => <>{value}º</> },
  { field: 'name', headerName: 'Nombre', flex: 1 },
]

const CohortsListPage = () => <ListPage columns={columns} fetchingService={cohortsList} title='Divisiones' />

export default CohortsListPage

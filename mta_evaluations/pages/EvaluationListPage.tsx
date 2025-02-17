"use client"

import { evaluationList } from '@/mta_evaluations/services'
import ListPage from '@/shared/components/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'title', headerName: 'Título', flex: 2 },
  { field: 'questions_per_page', headerName: 'Preguntas p/página', flex: 1 },
]

const EvaluationListPage = () => <ListPage columns={columns} fetchingService={evaluationList} title='Evaluaciones' />


export default EvaluationListPage

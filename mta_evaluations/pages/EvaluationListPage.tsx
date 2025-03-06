'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import EvaluationStatusChip from '@/mta_evaluations/components/EvaluationStatusChip'
import {
  useEvaluationBatchDelete,
  useEvaluationList,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationCreate,
  useNavigateToEvaluationDetail,
} from '@/mta_evaluations/hooks'
import Chip from '@/shared/components/Chip'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'title', headerName: 'Título', flex: 2 },
  {
    field: 'code',
    headerName: 'Código',
    flex: 1,
    renderCell: (params) => <Chip variant="outlined" size="small" label={params.value} />,
  },
  {
    field: 'status',
    headerName: 'Estado',
    flex: 1,
    renderCell: (params) => <EvaluationStatusChip status={params.value} size="small" />,
  },

  // { field: 'questions_per_page', headerName: 'Preguntas p/página', flex: 1 },
]

const EvaluationListPage = () => {
  const batchDelete = useEvaluationBatchDelete()
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()
  const navigateToEvaluationCreate = useNavigateToEvaluationCreate()

  return (
    <ListPage
      columns={columns}
      useList={useEvaluationList}
      title="Evaluaciones"
      onBatchDelete={batchDelete}
      onCreate={navigateToEvaluationCreate}
      onRowClick={(params) => navigateToEvaluationContentEdit({ id: params.id })}
    />
  )
}

export default withAuth(EvaluationListPage, ['admin', 'evaluator', 'school_staff'])

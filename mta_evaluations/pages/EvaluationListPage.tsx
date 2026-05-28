'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import EvaluationStatusChip from '@/mta_evaluations/components/EvaluationStatusChip'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationBatchDelete,
  useEvaluationList,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationCreate,
} from '@/mta_evaluations/hooks'
import Chip from '@/shared/components/Chip'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import { SubjectChip } from '@/mta_evaluations/components/SubjectOptions'

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'title', headerName: 'Título', flex: 2 }),
    {
    field: 'grade',
    headerName: 'Grado',
    flex: 1,
    renderCell: (params) => params.value ? `${params.value}º` : '',
  },
    {
    field: 'subject_id',
    headerName: 'Materia',
    flex: 1,
    renderCell: (params) => <SubjectChip id={params.value} />,
  },
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


]

const EvaluationListPage = () => {
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()
  const navigateToEvaluationCreate = useNavigateToEvaluationCreate()

  return (
    <ListPage
      columns={columns}
      useList={useEvaluationList}
      entityName={EVALUATION_NAME}
      useBatchDelete={useEvaluationBatchDelete}
      onCreate={navigateToEvaluationCreate}
      onRowClick={(params) => navigateToEvaluationContentEdit({ evaluationId: params.id })}
    />
  )
}

export default withAuth(EvaluationListPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

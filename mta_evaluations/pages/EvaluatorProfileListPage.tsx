'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluatorProfileBatchDelete,
  useEvaluatorProfileList,
  useNavigateToEvaluatorProfileCreate,
  useNavigateToEvaluatorProfileDetail,
} from '@/mta_evaluations/hooks/evaluators'
import { I_EvaluatorProfileListItem } from '@/mta_evaluations/types/evaluatorProfile'

import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_EvaluatorProfileListItem>> = [
  idExposeColumn({ field: 'username', headerName: 'Usuario', flex: 1.5 }),
  { field: 'email', headerName: 'Email', flex: 1.5 },
  { field: 'first_name', headerName: 'Nombre', flex: 1 },
  { field: 'last_name', headerName: 'Apellido', flex: 1 },
]

const EvaluatorProfileListPage = () => {
  const navToDetail = useNavigateToEvaluatorProfileDetail()
  const navToCreate = useNavigateToEvaluatorProfileCreate()

  return (
    <ListPage
      columns={columns}
      useList={useEvaluatorProfileList}
      entityName={EVALUATOR_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useEvaluatorProfileBatchDelete}
    />
  )
}

export default withAuth(EvaluatorProfileListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})

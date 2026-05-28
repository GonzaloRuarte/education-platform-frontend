'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_SUBJECT_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationSubjectBatchDelete,
  useEvaluationSubjectList,
  useNavigateToEvaluationSubjectCreate,
  useNavigateToEvaluationSubjectDetail,
} from '@/mta_evaluations/hooks'
import ResourceListPage from '@/shared/resources/ResourceListPage'

const EVALUATION_SUBJECT_RESOURCE_KEY = 'evaluation_subject'

const EvaluationSubjectListPage = () => {
  const navigateToEvaluationSubjectCreate = useNavigateToEvaluationSubjectCreate()
  const navigateToEvaluationSubjectDetail = useNavigateToEvaluationSubjectDetail()

  return (
    <ResourceListPage
      resourceKey={EVALUATION_SUBJECT_RESOURCE_KEY}
      useList={useEvaluationSubjectList}
      entityName={EVALUATION_SUBJECT_NAME}
      useBatchDelete={useEvaluationSubjectBatchDelete}
      onCreate={navigateToEvaluationSubjectCreate}
      onRowClickId={navigateToEvaluationSubjectDetail}
    />
  )
}

export default withAuth(EvaluationSubjectListPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_SUBJECT_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationSubjectDelete,
  useEvaluationSubjectDetail,
  useEvaluationSubjectUpdate,
  useLoadAndStoreEvaluationSubjects,
  useNavigateToEvaluationSubjectList,
} from '@/mta_evaluations/hooks'
import ResourceEditionPage from '@/shared/resources/ResourceEditionPage'

const EVALUATION_SUBJECT_RESOURCE_KEY = 'evaluation_subject'

const EvaluationSubjectEditPage = () => {
  const navigateToEvaluationSubjectList = useNavigateToEvaluationSubjectList()
  const loadAndStoreEvaluationSubjects = useLoadAndStoreEvaluationSubjects()
  const reloadCacheAndNavigateToList = () => {
    loadAndStoreEvaluationSubjects().finally(navigateToEvaluationSubjectList)
  }

  return (
    <ResourceEditionPage
      resourceKey={EVALUATION_SUBJECT_RESOURCE_KEY}
      useDetail={useEvaluationSubjectDetail}
      useUpdate={useEvaluationSubjectUpdate}
      useDelete={useEvaluationSubjectDelete}
      entityName={EVALUATION_SUBJECT_NAME}
      onExit={reloadCacheAndNavigateToList}
    />
  )
}

export default withAuth(EvaluationSubjectEditPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

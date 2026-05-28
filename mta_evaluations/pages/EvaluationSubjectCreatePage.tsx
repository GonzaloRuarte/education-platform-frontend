'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_SUBJECT_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationSubjectCreate,
  useLoadAndStoreEvaluationSubjects,
  useNavigateToEvaluationSubjectList,
} from '@/mta_evaluations/hooks'
import ResourceCreationPage from '@/shared/resources/ResourceCreationPage'

const EVALUATION_SUBJECT_RESOURCE_KEY = 'evaluation_subject'

const EvaluationSubjectCreatePage = () => {
  const navigateToEvaluationSubjectList = useNavigateToEvaluationSubjectList()
  const loadAndStoreEvaluationSubjects = useLoadAndStoreEvaluationSubjects()
  const reloadCacheAndNavigateToList = () => {
    loadAndStoreEvaluationSubjects().finally(navigateToEvaluationSubjectList)
  }

  return (
    <ResourceCreationPage
      resourceKey={EVALUATION_SUBJECT_RESOURCE_KEY}
      useCreate={useEvaluationSubjectCreate}
      entityName={EVALUATION_SUBJECT_NAME}
      onCancel={navigateToEvaluationSubjectList}
      onCreated={reloadCacheAndNavigateToList}
    />
  )
}

export default withAuth(EvaluationSubjectCreatePage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

'use client'

import EvaluationCreateForm from '@/mta_evaluations/components/EvaluationCreateForm'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const EvaluationCreatePage = () => (
  <CreationPage
    CreationForm={EvaluationCreateForm}
    entityName={EVALUATION_NAME}
    onCancel={useNavigateToEvaluationList()}
  />
)

export default EvaluationCreatePage

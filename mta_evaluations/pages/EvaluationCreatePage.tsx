'use client'

import EvaluationCreateForm from '@/mta_evaluations/components/EvaluationCreateForm'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const EvaluationCreatePage = () => {
  const navigateToList = useNavigateToEvaluationList()

  return <CreationPage CreationForm={EvaluationCreateForm} entityName={EVALUATION_NAME} onCancel={navigateToList} />
}

export default EvaluationCreatePage

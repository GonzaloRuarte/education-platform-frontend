'use client'

import EvaluationCreateForm from '@/mta_evaluations/components/EvaluationCreateForm'
import { useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import CreationPage from '@/shared/components/CreationPage'

const EvaluationCreatePage = () => {
  const navigateToList = useNavigateToEvaluationList()

  return <CreationPage CreationForm={EvaluationCreateForm} entityName="Evaluación" onCancel={navigateToList} />
}

export default EvaluationCreatePage

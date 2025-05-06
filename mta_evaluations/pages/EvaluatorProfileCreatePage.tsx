'use client'

import EvaluatorProfileCreateForm from '@/mta_evaluations/components/EvaluatorProfileCreateForm'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import { useNavigateToEvaluatorProfileList } from '@/mta_evaluations/hooks/evaluators'
import CreationPage from '@/shared/pages/CreationPage'

const EvaluatorProfileCreatePage = () => {
  const navToList = useNavigateToEvaluatorProfileList()

  return (
    <CreationPage CreationForm={EvaluatorProfileCreateForm} entityName={EVALUATOR_PROFILE_NAME} onCancel={navToList} />
  )
}

export default EvaluatorProfileCreatePage

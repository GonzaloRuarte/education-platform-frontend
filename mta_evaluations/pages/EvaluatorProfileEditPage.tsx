'use client'

import EvaluatorProfileUpdateForm from '@/mta_evaluations/components/EvaluatorProfileUpdateForm'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluatorProfileDelete,
  useEvaluatorProfileDetail,
  useNavigateToEvaluatorProfileList,
} from '@/mta_evaluations/hooks/evaluators'
import EditionPage from '@/shared/pages/EditionPage'

const EvaluatorProfileEditPage = () => {
  const navToList = useNavigateToEvaluatorProfileList()

  return (
    <EditionPage
      EditionForm={EvaluatorProfileUpdateForm}
      entityName={EVALUATOR_PROFILE_NAME}
      onExit={navToList}
      useDetail={useEvaluatorProfileDetail}
      useDelete={useEvaluatorProfileDelete}
    />
  )
}

export default EvaluatorProfileEditPage

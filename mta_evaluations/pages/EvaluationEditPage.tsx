'use client'

import EvaluationEditForm from '@/mta_evaluations/components/EvaluationEditForm'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const EvaluationEditPage = () => (
  <EditionPage
    EditionForm={EvaluationEditForm}
    entityName={EVALUATION_NAME}
    useDelete={useEvaluationDelete}
    useDetail={useEvaluationDetail}
    onExit={useNavigateToEvaluationList()}
    idFieldName="evaluationId"
  />
)

export default EvaluationEditPage

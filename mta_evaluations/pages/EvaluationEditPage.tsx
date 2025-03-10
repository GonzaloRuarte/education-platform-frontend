'use client'

import EvaluationEditForm from '@/mta_evaluations/components/EvaluationEditForm'
import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const EvaluationEditPage = () => (
  <EditionPage
    EditionForm={EvaluationEditForm}
    entityName="Evaluación"
    useDelete={useEvaluationDelete}
    useDetail={useEvaluationDetail}
    useNavigateToList={useNavigateToEvaluationList}
    idFieldName="evaluationId"
  />
)

export default EvaluationEditPage

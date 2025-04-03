'use client'

import EvaluationEditForm from '@/mta_evaluations/components/EvaluationEditForm'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationDelete, useEvaluationDetail, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'
import { useParams } from 'next/navigation'

const EvaluationEditPage = () => {
  const { evaluationId } = useParams()
  const nav = useNavigateToEvaluationContentEdit()
  return (
    <EditionPage
      EditionForm={EvaluationEditForm}
      entityName={EVALUATION_NAME}
      useDelete={useEvaluationDelete}
      useDetail={useEvaluationDetail}
      onExit={() => {
        nav({ evaluationId: Number(evaluationId) })
      }}
      idFieldName="evaluationId"
    />
  )
}

export default EvaluationEditPage

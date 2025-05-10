'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import EvaluationEditForm from '@/mta_evaluations/components/EvaluationEditForm'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluationDelete,
  useEvaluationDetail,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationList,
} from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'
import { useParams } from 'next/navigation'

const EvaluationEditPage = () => {
  const { evaluationId } = useParams()
  const nav = useNavigateToEvaluationContentEdit()
  const navToList = useNavigateToEvaluationList()
  return (
    <EditionPage
      EditionForm={EvaluationEditForm}
      entityName={EVALUATION_NAME}
      useDelete={useEvaluationDelete}
      overridedExitOnDelete={navToList}
      useDetail={useEvaluationDetail}
      onExit={() => {
        nav({ evaluationId: Number(evaluationId) })
      }}
      idFieldName="evaluationId"
    />
  )
}

export default withAuth(EvaluationEditPage, {
  allowedUserProfiles: ['admin', 'evaluator'],
  logoutDestination: 'dashboard',
})

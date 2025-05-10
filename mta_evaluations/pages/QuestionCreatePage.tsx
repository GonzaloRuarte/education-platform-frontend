'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import MultipleChoiceCreateForm from '@/mta_evaluations/components/MultipleChoiceCreateForm'
import NumericCreateForm from '@/mta_evaluations/components/NumericCreateForm'
import { MULTIPLE_CHOICE_NAME, urlPathsToAnswerTypes } from '@/mta_evaluations/constants'
import { useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import { T_AnswerType } from '@/mta_evaluations/types'
import CreationPage from '@/shared/pages/CreationPage'
import { useParams, useSearchParams } from 'next/navigation'
import { FC } from 'react'

const MultipleChoiceCreatePage = ({ evaluationId }) => {
  const back = useNavigateToEvaluationContentEdit()
  return (
    <CreationPage
      CreationForm={MultipleChoiceCreateForm}
      entityName={MULTIPLE_CHOICE_NAME}
      onCancel={() => {
        back({ evaluationId })
      }}
    />
  )
}
const NumericCreatePage = ({ evaluationId }) => {
  const back = useNavigateToEvaluationContentEdit()
  return (
    <CreationPage
      CreationForm={NumericCreateForm}
      entityName={MULTIPLE_CHOICE_NAME}
      onCancel={() => {
        back({ evaluationId })
      }}
    />
  )
}

const pages: Record<T_AnswerType, FC<any>> = {
  MultipleChoice: MultipleChoiceCreatePage,
  Numeric: NumericCreatePage,
}

const QuestionCreatePage = () => {
  const { evaluationId } = useParams()
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('tipo')

  if (urlParam === null || !(urlParam in urlPathsToAnswerTypes)) {
    return <>El tipo de pregunta indicado no existe.</>
  }

  const answerType = urlPathsToAnswerTypes[urlParam]
  const PageContent = pages[answerType]
  return <PageContent evaluationId={Number(evaluationId)} />
}

export default withAuth(QuestionCreatePage, {
  allowedUserProfiles: ['admin', 'evaluator'],
  logoutDestination: 'dashboard',
})

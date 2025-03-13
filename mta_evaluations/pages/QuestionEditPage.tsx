'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import QuestionEditForm from '@/mta_evaluations/components/QuestionEditForm'
import { QUESTION_NAME } from '@/mta_evaluations/constants'
import { useQuestionDelete, useQuestionDetail } from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'
import { useRouter } from 'next/navigation'

const QuestionEditPage = () => (
  <EditionPage
    EditionForm={QuestionEditForm}
    entityName={QUESTION_NAME}
    idFieldName="questionId"
    useDelete={useQuestionDelete}
    useDetail={useQuestionDetail}
    onExit={useRouter().back}
  />
)

export default withAuth(QuestionEditPage, ['admin', 'evaluator'])

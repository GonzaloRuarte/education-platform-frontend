'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import QuestionEditForm from '@/mta_evaluations/components/QuestionEditForm'
import { useQuestionDetail } from '@/mta_evaluations/hooks'
import EditionPage from '@/shared/pages/EditionPage'
import { useRouter } from 'next/navigation'

const QuestionEditPage = () => (
  <EditionPage EditionForm={QuestionEditForm} entityName="Pregunta" idFieldName="questionId" useDetail={useQuestionDetail} onExit={useRouter().back} />
)

export default withAuth(QuestionEditPage, ['admin', 'evaluator'])

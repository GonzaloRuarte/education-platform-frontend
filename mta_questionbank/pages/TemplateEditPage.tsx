'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'

import QuestionEditForm from '@/mta_questionbank/components/QuestionEditForm'
import { QUESTION_NAME } from '@/mta_questionbank/constants'

import {
  useQuestionDelete,
  useQuestionDetail,
  useNavigateToQuestionBankList,
} from '@/mta_questionbank/hooks'

import EditionPage from '@/shared/pages/EditionPage'



const TemplateEditPage = () => {
  const back = useNavigateToQuestionBankList()

  return (
    <EditionPage
      EditionForm={QuestionEditForm}
      entityName={QUESTION_NAME}
      idFieldName="questionId"               /* or 'templateId' – match your route param */
      useDelete={useQuestionDelete}
      useDetail={useQuestionDetail}
      onExit={back}
    />
  )
}

export default withAuth(TemplateEditPage, {
  allowedCapabilities: ['manage_evaluation_content'],
  logoutDestination: 'dashboard',
})

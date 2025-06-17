'use client'

import MultipleChoiceEditForm from '@/mta_questionbank/components/MultipleChoiceEditForm'
import NumericEditForm from '@/mta_questionbank/components/NumericEditForm'
import OpenEndedEditForm from '@/mta_questionbank/components/OpenEndedEditForm'
import { I_QuestionDetail, T_AnswerPolymorphicDetail, T_AnswerType, T_QuestionForm } from '@/mta_questionbank/types'
import { T_VoidFn } from '@/shared/types'

const formComponents: Record<T_AnswerType, T_QuestionForm<T_AnswerPolymorphicDetail>> = {
  MultipleChoiceTemplate: MultipleChoiceEditForm,
  NumericTemplate: NumericEditForm,
  OpenEndedTemplate: OpenEndedEditForm,
}

interface I_Props {
  data: I_QuestionDetail
  reload: T_VoidFn
}

const QuestionEditForm = ({ data, reload }: I_Props) => {
  const resource_type = data.answer.resource_type

  const Form = formComponents[resource_type]
  return <Form {...{ data, reload }} />
}

export default QuestionEditForm

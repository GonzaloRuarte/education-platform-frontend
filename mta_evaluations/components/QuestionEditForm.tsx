'use client'

import MultipleChoiceEditForm from '@/mta_evaluations/components/MultipleChoiceEditForm'
import NumericEditForm from '@/mta_evaluations/components/NumericEditForm'
import { I_QuestionDetail, T_AnswerPolymorphicDetail, T_AnswerType, T_QuestionForm } from '@/mta_evaluations/types'
import { T_VoidFn } from '@/shared/types'

const formComponents: Record<T_AnswerType, T_QuestionForm<T_AnswerPolymorphicDetail>> = {
  MultipleChoice: MultipleChoiceEditForm,
  Numeric: NumericEditForm,
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

'use client'

import { useDialog } from '@/shared/dialogs'
import MultipleChoiceEditForm from '@/mta_evaluations/components/MultipleChoiceEditForm'
import NumericEditForm from '@/mta_evaluations/components/NumericEditForm'
import {
  I_QuestionDetail,
  T_AnswerPolymorphicDetail,
  T_AnswerType,
  T_QuestionForm,
} from '@/mta_evaluations/types'

const formComponents: Record<
  T_AnswerType,
  T_QuestionForm<T_AnswerPolymorphicDetail>
> = {
  MultipleChoice: MultipleChoiceEditForm,
  Numeric: NumericEditForm,
}

/**
 * Call open(question, reload) to show an edit dialog.
 * Mount <DialogComponent {...componentProps} /> once per page.
 */
const QuestionEditDialog = () => {
  const { showDialog, closeDialog, DialogComponent, componentProps } = useDialog()

  /** Close dialog, then refresh list */
  const makeOnSuccess = (reload: () => void) => () => {
    closeDialog()
    reload()
  }

  const open = (question: I_QuestionDetail, reload: () => void) => {
    const Form = formComponents[question.answer.resource_type]

    showDialog({
      title: 'Editar pregunta',
      content: (
        <Form
          data={question}
          onSuccess={makeOnSuccess(reload)}
          onCancel={closeDialog}
        />
      ),
      actions: [],
    })
  }

  return { open, DialogComponent, componentProps }
}

export default QuestionEditDialog
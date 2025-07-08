'use client'

import { useDialog } from '@/shared/dialogs'
import MultipleChoiceEditForm from '@/mta_evaluations/components/MultipleChoiceEditForm'
import NumericEditForm from '@/mta_evaluations/components/NumericEditForm'
import OpenEndedEditForm from '@/mta_evaluations/components/OpenEndedEditForm'
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
  OpenEnded: OpenEndedEditForm,
}

/**
 * Call open(question, reload) to show an edit dialog.
 * Mount <DialogComponent {...componentProps} /> once per page.
 */
const QuestionEditDialog = () => {
  const { showDialog, closeDialog, DialogComponent, componentProps } = useDialog()

  const handleUpdated = (reloadPage: () => void) => () => {
    closeDialog()      // close the modal
    reloadPage()       // refresh evaluation list
  }
  const open = (question: I_QuestionDetail, reload: () => void) => {
    const Form = formComponents[question.answer.resource_type]

    showDialog({
      title: 'Editar pregunta',
      content: (
        <Form
          data={question}
          onSuccess={handleUpdated(reload)}
          onCancel={closeDialog}
        />
      ),
      actions: [],
    })
  }

  return { open, DialogComponent, componentProps }
}

export default QuestionEditDialog
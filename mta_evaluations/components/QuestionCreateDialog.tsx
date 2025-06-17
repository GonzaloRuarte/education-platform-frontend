'use client'

import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import { useDialog } from '@/shared/dialogs'
import { T_VoidFn } from '@/shared/types'
import NumericCreateForm from '@/mta_evaluations/components/NumericCreateForm'
import MultipleChoiceCreateForm from '@/mta_evaluations/components/MultipleChoiceCreateForm'
import OpenEndedCreateForm from '@/mta_evaluations/components/OpenEndedCreateForm'
import { T_EvaluationPageId } from '@/mta_evaluations/types'

/**
 * Exposes:
 *   • open(evaluation_page_id)
 *   • <DialogComponent {...componentProps} />
 *
 * Usage:
 *   const { open, DialogComponent, componentProps } = useCreateQuestionDialog();
 *   ...
 *   <Button onClick={() => open(evaluation_page_id)}>Añadir pregunta</Button>
 *   <DialogComponent {...componentProps} />
 */
const QuestionCreateDialog = () => {
  const { showDialog, closeDialog, DialogComponent, componentProps } = useDialog()


  /** open the 2-option selector (step 1) */
  const open = (evaluation_page_id: T_EvaluationPageId, reload: T_VoidFn) => {
    showDialog({
      title: 'Tipo de pregunta',
      content: (
        <MagicGrid itemSize="auto">
          <Button
            variant="outlined"
            onClick={() => {
              closeDialog() // close selector
              openNumericDialog(evaluation_page_id, reload)
            }}
          >
            Numérica
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              closeDialog()
              openMultipleChoiceDialog(evaluation_page_id, reload)
            }}
          >
            Opción múltiple
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              closeDialog()
              openOpenEndedDialog(evaluation_page_id, reload)
            }}
          >
            Texto libre
          </Button>
        </MagicGrid>
      ),
      actions: [], // no footer buttons – the inner buttons cover all actions
    })
  }

  /** helper to open numeric form (step 2) */
  const openNumericDialog = (evaluation_page_id: T_EvaluationPageId, reload: T_VoidFn) => {
    showDialog({
      title: 'Pregunta numérica',
      content: (
        <NumericCreateForm
          page_id={evaluation_page_id}
          onSuccess={() => {
            reload()
            closeDialog()
          }}
          onCancel={closeDialog}
        />
      ),
      actions: [],
    })
  }

  /** helper to open MC form (step 2) */
  const openMultipleChoiceDialog = (evaluation_page_id: T_EvaluationPageId, reload: T_VoidFn) => {
    showDialog({
      title: 'Pregunta de opción múltiple',
      content: (
        <MultipleChoiceCreateForm
          page_id={evaluation_page_id}
          onSuccess={() => {
            reload()
            closeDialog()
          }}
          onCancel={closeDialog}
        />
      ),
      actions: [],
    })
  }
  /** helper to open open-ended form (step 2) */
  const openOpenEndedDialog = (evaluation_page_id: T_EvaluationPageId, reload: T_VoidFn) => {
    showDialog({
      title: 'Pregunta de texto libre',
      content: (
        <OpenEndedCreateForm
          page_id={evaluation_page_id}
          onSuccess={() => {
            reload()
            closeDialog()
          }}
          onCancel={closeDialog}
        />
      ),
      actions: [],
    })
  }

  return { open, DialogComponent, componentProps }
}

export default QuestionCreateDialog

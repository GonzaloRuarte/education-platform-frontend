import {
  useNavigateToQuestionCreateMultipleChoice,
  useNavigateToQuestionCreateNumeric,
  useEvaluationPageDelete,
} from '@/mta_evaluations/hooks'
import { evaluationPageLabels, questionLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationPageDetail, T_AnswerType, T_EvaluationId, T_EvaluationStatusCode } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { useDialog } from '@/shared/dialogs'
import { sharedLabels } from '@/shared/labels'
import { T_VoidFn } from '@/shared/types'
import QuizIcon from '@mui/icons-material/Quiz'
import Grid from '@mui/material/Grid2'
import { FC } from 'react'
import ImportFromBankDialog from '@/mta_evaluations/components/ImportFromBankDialog'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import CreatedQuestions from '@/mta_evaluations/components/CreatedQuestions'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { EVALUATION_PAGE_NAME } from '@/mta_evaluations/constants'


const CreateQuestionDialogContent: FC<{ close: T_VoidFn; evaluationId: T_EvaluationId }> = ({
  close,
  evaluationId,
}) => {
  const navToCreateMC = useNavigateToQuestionCreateMultipleChoice()
  const navToCreateNumeric = useNavigateToQuestionCreateNumeric()

  const buttons: Record<T_AnswerType, FC<any>> = {
    MultipleChoice: () => <Button onClick={() => navToCreateMC({ evaluationId })}>Opción Múltiple</Button>,
    Numeric: () => <Button onClick={() => navToCreateNumeric({ evaluationId })}>Numérica</Button>,
  }
  return (
    <>
      <MagicGrid itemSize="auto">
        {Object.entries(buttons).map(([key, CreationButton]) => (
          <CreationButton key={key} />
        ))}
      </MagicGrid>
      <Spacer />
    </>
  )
}

const QuestionCreationToolbar = ({ evaluation_id, status, data, reload }: { evaluation_id: T_EvaluationId; status: T_EvaluationStatusCode; data: I_EvaluationPageDetail; reload: T_VoidFn }) => {
  const { showDialog, closeDialog, DialogComponent, componentProps } = useDialog()
  const deleteInstance = useEvaluationPageDelete()
  const handleCreateQuestion = () => {
    showDialog({
      title: questionLabels.create,
      content: <CreateQuestionDialogContent close={closeDialog} evaluationId={evaluation_id} />,
      actions: [{ buttonLabel: sharedLabels.cancel, key: sharedLabels.cancel, onPress: closeDialog }],
    })
  }
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const handleDelete = useHandleDelete(data.id, {
    showConfirm,
    deleteInstance,
    callback: reload,
    entityName: EVALUATION_PAGE_NAME,
  })
  const handleImportFromBank = () => {
    const closeAndReload = () => {
        closeDialog()   // ← from useDialog
        reload()       // ← refresh evaluation page
      }
    showDialog({
      title: 'Importar desde Banco de Preguntas',
      content: (
        <ImportFromBankDialog
          evaluationPageId={data.id}          
        />
      ),
      actions: [{ key: 'close', buttonLabel: sharedLabels.cancel, onPress: closeAndReload }],
      dialogProps: {                      // ← now legal
        fullWidth: true, // or false
        maxWidth: 'xl',   // or 'sm', 'lg', etc.
        onClose: (_e, _reason) => closeAndReload(),
      },
    })
  }
  const handleDeletePage = () => {handleDelete() }

  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">          
          <MagicGrid itemSize={'auto'}>
            <Button
              disabled={status === EvaluationStatus.Published}
              onClick={handleCreateQuestion}
              startIcon={<QuizIcon />}
            >
              {evaluationPageLabels.newQuestion}
            </Button>
            
          <Button
            disabled={status === EvaluationStatus.Published}
            onClick={handleImportFromBank}
            startIcon={<LibraryAddIcon />}
          >
            Importar Pregunta
          </Button>
          <DeleteButton
            disabled={status === EvaluationStatus.Published}
            color="error"
            onClick={handleDeletePage}
          />
          </MagicGrid>
        </Grid>
        <CreatedQuestions {...{ evaluationStatus: status, data: data, reload }} />
      </Pastilla>
      <ConfirmDialogComponent />
      <DialogComponent {...componentProps} />
    </>
  )
  
}

export default QuestionCreationToolbar

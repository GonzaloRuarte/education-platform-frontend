import {
  useAddPageBreak,
  useNavigateToQuestionCreateMultipleChoice,
  useNavigateToQuestionCreateNumeric,
} from '@/mta_evaluations/hooks'
import { evaluationLabels, questionLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationDetail, T_AnswerType, T_EvaluationId } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { Body1 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import { handleServiceError } from '@/shared/service'
import { T_VoidFn } from '@/shared/types'
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak'
import QuizIcon from '@mui/icons-material/Quiz'
import Grid from '@mui/material/Grid2'
import { FC } from 'react'

const AddPageBreakForm: FC<{ close: T_VoidFn; reload: T_VoidFn; questions: I_EvaluationDetail['questions'] }> = ({
  reload,
  close,
  questions,
}) => {
  const add = useAddPageBreak()
  const availableQuestions = questions.filter((question) => !question.breaks_page_after)
  if (availableQuestions.length === 0) {
    return <Body1>Ups. Ya tienen salto de línea todas las preguntas.</Body1>
  }
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  return (
    <>
      <Body1>Agregar salto después de pregunta nº...</Body1>
      <Spacer />
      <MagicGrid itemSize="auto">
        {availableQuestions.map((question) => (
          <Button
            key={question.id}
            onClick={() => {
              setIsInProgress()
              add({ after_question_id: question.id })
                .then(() => {
                  close()
                  reload()
                })
                .catch(handleServiceError)
                .finally(setIsNotInProgress)
            }}
          >
            {question.order + 1}
          </Button>
        ))}
      </MagicGrid>
    </>
  )
}

const CreateQuestionDialogContent: FC<{ close: T_VoidFn; evaluationId: T_EvaluationId }> = ({
  close,
  evaluationId,
}) => {
  const navToCreateMC = useNavigateToQuestionCreateMultipleChoice()
  const navToCreateNumeric = useNavigateToQuestionCreateNumeric()

  const buttons: Record<T_AnswerType, FC<any>> = {
    MultipleChoice: () => <Button onClick={() => navToCreateMC({ evaluationId })}>Multiple Choice</Button>,
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

const QuestionCreationToolbar = ({ data, reload }: { data: I_EvaluationDetail; reload: T_VoidFn }) => {
  const { showDialog, closeDialog, DialogComponent, componentProps } = useDialog()
  const handleAddPageBreak = () => {
    showDialog({
      title: questionLabels.pageBreak.add,
      content: <AddPageBreakForm close={closeDialog} reload={reload} questions={data.questions} />,
      actions: [{ buttonLabel: sharedLabels.cancel, key: sharedLabels.cancel, onPress: closeDialog }],
    })
  }
  const handleCreateQuestion = () => {
    showDialog({
      title: questionLabels.create,
      content: <CreateQuestionDialogContent close={closeDialog} evaluationId={data.id} />,
      actions: [{ buttonLabel: sharedLabels.cancel, key: sharedLabels.cancel, onPress: closeDialog }],
    })
  }
  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size="grow">{evaluationLabels.create}</Grid>
          <MagicGrid itemSize={'auto'}>
            <Button
              disabled={data.status === EvaluationStatus.Published}
              onClick={handleAddPageBreak}
              startIcon={<InsertPageBreakIcon />}
            >
              {evaluationLabels.pageBreak}
            </Button>
            <Button
              disabled={data.status === EvaluationStatus.Published}
              onClick={handleCreateQuestion}
              startIcon={<QuizIcon />}
            >
              {evaluationLabels.newQuestion}
            </Button>
          </MagicGrid>
        </Grid>
      </Pastilla>
      <DialogComponent {...componentProps} />
    </>
  )
}

export default QuestionCreationToolbar

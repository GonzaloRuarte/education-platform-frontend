import { useAddPageBreak } from '@/mta_evaluations/hooks'
import { evaluationLabels, questionLabels } from '@/mta_evaluations/labels'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { Body1 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { sharedLabels } from '@/shared/labels'
import { T_VoidFn } from '@/shared/types'
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak'
import QuizIcon from '@mui/icons-material/Quiz'
import Grid from '@mui/material/Grid2'
import { FC } from 'react'

const AddPageBreakForm: FC<{ close: T_VoidFn; reload: T_VoidFn; questions: I_EvaluationDetail['questions'] }> = ({ reload, close, questions }) => {
  const add = useAddPageBreak()
  return (
    <>
      <Body1>Agregar salto después de pregunta nº...</Body1>
      <Spacer />
      <MagicGrid itemSize="auto">
        {questions.map((question) => (
          <Button
            key={question.id}
            onClick={() => {
              add({ after_question_id: question.id })

              close()
              reload()
            }}
          >
            {question.order + 1}
          </Button>
        ))}
      </MagicGrid>
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
  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size="grow">{evaluationLabels.create}</Grid>
          <MagicGrid itemSize={'auto'}>
            <Button onClick={handleAddPageBreak} startIcon={<InsertPageBreakIcon />}>
              {evaluationLabels.pageBreak}
            </Button>
            <Button startIcon={<QuizIcon />}>{evaluationLabels.newQuestion}</Button>
          </MagicGrid>
        </Grid>
      </Pastilla>
      <DialogComponent {...componentProps} />
    </>
  )
}

export default QuestionCreationToolbar

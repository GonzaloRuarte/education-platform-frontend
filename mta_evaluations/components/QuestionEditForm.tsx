'use client'

import { useEvaluationUpdate, useMultipleChoiceOptionDelete, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import {
  I_EvaluationDetail_MultipleChoiceAnswer,
  I_EvaluationDetail_NumericAnswer,
  I_QuestionDetail,
  I_QuestionEditRequestData,
  T_AnswerType,
  T_MultiplChoiceOptionId,
} from '@/mta_evaluations/types'
import Bold from '@/shared/components/Bold'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1 } from '@/shared/components/Typography'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Checkbox, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useRouter } from 'next/navigation'
import { FC, Fragment } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
interface I_FormFields extends I_QuestionEditRequestData {}

const MultipleChoice: FC<{ data: I_EvaluationDetail_MultipleChoiceAnswer; reload: () => void }> = ({ data, reload }) => {
  const deleteInstance = useMultipleChoiceOptionDelete()
  const router = useRouter()
  const handleDelete = (id: T_MultiplChoiceOptionId) => {
    deleteInstance(id)
    reload()
  }

  return (
    <Box maxWidth="md">
      {data.options.map((option) => {
        return (
          <Grid spacing={1} key={option.id} component="div" container justifyContent="center" alignItems="center">
            <Grid>
              <Checkbox checked={option.is_true} />
            </Grid>
            <Grid size="auto">
              <Chip label={option.name} />
            </Grid>
            <Grid size="grow">{option.content}</Grid>
            <Grid size={1} container>
              <Grid>
                <IconButton onClick={() => handleDelete(option.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        )
      })}
    </Box>
  )
}
const Numeric: FC<{ data: I_EvaluationDetail_NumericAnswer }> = ({ data }) => {
  return (
    <Fragment key={data.id}>
      <Body1>
        Respuesta: <Bold>{data.value}</Bold>
      </Body1>
    </Fragment>
  )
}

const answersContentComponents: Record<T_AnswerType, FC<any>> = {
  MultipleChoice,
  Numeric,
}

interface I_Props {
  data: I_QuestionDetail
  reload: () => void
}
const QuestionEditForm = ({ data, reload }: I_Props) => {
  const { answer, content, id, is_mandatory } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
    },
  })

  const { setIsInProgress } = useInProgress()
  const navigateToEvaluationList = useNavigateToEvaluationList()
  const evaluationUpdate = useEvaluationUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    // setIsInProgress(true)
    // evaluationUpdate(data.id, { ...updatedData, subject_id: updatedData.subject_id as string })
    //   .then((res) => {
    //     log.info('New Evaluation added:', res)
    //     successToast('Evaluación editada correctamente')
    //     navigateToEvaluationList()
    //   })
    //   .catch(handleServiceError)
    //   .finally(() => {
    //     setIsInProgress(false)
    //   })
  }
  const AnswerContent = answersContentComponents[data.answer.resource_type]
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        {/* <Input<I_FormFields> {...{ control }} name="title" rules={{ ...rules.required() }} label={questionLabels.title} /> */}
        {/* <Input<I_FormFields> {...{ control }} name="code" rules={{ ...rules.required() }} label={questionLabels.code} /> */}
        {/* <SubjectOptions {...{ control }} name="subject_id" /> */}
        <WysiwygEditor<I_FormFields> {...{ control }} label={questionLabels.content} rules={{ ...rules.required() }} name="content" />
      </MagicGrid>
      <Spacer />

      <AnswerContent data={data.answer} reload={reload} />
      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default QuestionEditForm

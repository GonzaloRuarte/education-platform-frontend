'use client'

import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import OptionCreateForm from '@/mta_evaluations/components/OptionCreateForm'
import { useEvaluationUpdate, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import {
  I_EvaluationDetail_MultipleChoiceAnswer,
  I_EvaluationDetail_NumericAnswer,
  I_QuestionDetail,
  I_QuestionEditRequestData,
  T_AnswerType,
} from '@/mta_evaluations/types'
import Bold from '@/shared/components/Bold'
import { AddButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import { T_VoidFn } from '@/shared/types'
import { Box } from '@mui/material'
import { FC, Fragment } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_QuestionEditRequestData {}

const MultipleChoice: FC<{ data: I_EvaluationDetail_MultipleChoiceAnswer; reload: T_VoidFn }> = ({ data, reload }) => {
  const { DialogComponent, componentProps, showDialog, closeDialog } = useDialog()
  const handleReloadAfterCreate = () => {
    closeDialog()
    reload()
  }
  const handleAddOption = () => {
    showDialog({
      title: 'Agregar Opción',
      content: <OptionCreateForm multipleChoiceId={data.id} reload={handleReloadAfterCreate} />,
      actions: [
        {
          buttonLabel: sharedLabels.cancel,
          onPress: closeDialog,
          key: 'close',
        },
      ],
    })
  }

  return (
    <>
      <Box maxWidth="md">
        <H4>
          Opciones <AddButton onClick={handleAddOption} size="small" variant="outlined" />
        </H4>
        <Spacer />

        {data.options.map((option) => (
          <MultipleChoiceOption key={option.id} data={option} reload={reload} withDelete />
        ))}
      </Box>
      <DialogComponent {...componentProps} />
    </>
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
  reload: T_VoidFn
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

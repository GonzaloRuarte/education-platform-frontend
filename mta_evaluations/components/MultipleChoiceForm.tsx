'use client'

import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import OptionCreateForm from '@/mta_evaluations/components/OptionCreateForm'
import { useNavigateToEvaluationContentEdit, useQuestionMultipleChoiceUpdate } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import { I_AnswerMultipleChoiceDetail, I_QuestionUpdateMultipleChoiceRequestData, T_QuestionForm } from '@/mta_evaluations/types'
import { AddButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { H4 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { T_VoidFn } from '@/shared/types'
import { Box } from '@mui/material'
import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_QuestionUpdateMultipleChoiceRequestData {}

const MultipleChoice: FC<{ data: I_AnswerMultipleChoiceDetail; reload: T_VoidFn }> = ({ data, reload }) => {
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

const MultipleChoiceForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = ({ data, reload }) => {
  const { content, evaluation_id } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
    },
  })

  const { setIsInProgress } = useInProgress()
  const backToDetail = useNavigateToEvaluationContentEdit()
  const update = useQuestionMultipleChoiceUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setIsInProgress(true)
    update(data.id, { ...updatedData })
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        backToDetail({ evaluationId: evaluation_id })
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <WysiwygEditor<I_FormFields> {...{ control }} label={questionLabels.content} rules={{ ...rules.required() }} name="content" />

        {/* This is only for Numeric:
    <Input<I_FormFields> {...{ control }} label={numericLabels.value} rules={{ ...rules.required() }} name="value" /> 
    */}
      </MagicGrid>
      <Spacer />

      <MultipleChoice data={data.answer} reload={reload} />
      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default MultipleChoiceForm

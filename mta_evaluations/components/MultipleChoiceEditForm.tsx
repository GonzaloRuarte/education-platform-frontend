'use client'

import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import OptionCreateForm from '@/mta_evaluations/components/OptionCreateForm'
import { useQuestionMultipleChoiceUpdate } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import {
  I_AnswerMultipleChoiceDetail,
  I_QuestionUpdateMultipleChoiceRequestData,
  T_QuestionForm,
} from '@/mta_evaluations/types'
import { AddButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Button from '@/shared/components/Button'
import { H4 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
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

interface OptionsProps {
  data: I_AnswerMultipleChoiceDetail
  onSuccess: T_VoidFn
  onCancel?: T_VoidFn
}


const Options: FC<OptionsProps> = ({ data, onSuccess, onCancel }) => {
  const { DialogComponent, componentProps, showDialog, closeDialog } = useDialog()
  const handleReloadAfterCreate = () => {
    closeDialog()
    onSuccess()
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
          <MultipleChoiceOption key={option.id} data={option} reload={onSuccess} withDelete />
        ))}
      </Box>
      <DialogComponent {...componentProps} />
    </>
  )
}




const MultipleChoiceEditForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = ({data, onSuccess, onCancel }) => {
  const { content } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const update = useQuestionMultipleChoiceUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    update(data.id, { ...updatedData })
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        onSuccess()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form>
      <MagicGrid>
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />
      </MagicGrid>
      <Spacer />

      <Options data={data.answer} onSuccess={onSuccess} onCancel={onCancel} />
      <Spacer />

      <Submit onClick={handleSubmit(onSubmit)}>{sharedLabels.update}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
    </form>
  )
}

export default MultipleChoiceEditForm

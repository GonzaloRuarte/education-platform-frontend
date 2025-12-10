'use client'

import MultipleChoiceOption from '@/mta_questionbank/components/MultipleChoiceOption'
import OptionCreateForm from '@/mta_questionbank/components/OptionCreateForm'
import { useNavigateToQuestionBankList, useQuestionMultipleChoiceUpdate } from '@/mta_questionbank/hooks'
import { questionLabels } from '@/mta_questionbank/labels'
import {
  I_AnswerMultipleChoiceDetail,
  I_QuestionUpdateMultipleChoiceRequestData,
  T_QuestionForm,
} from '@/mta_questionbank/types'
import { AddButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { H4 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { sharedLabels } from '@/shared/labels'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { Box } from '@mui/material'
import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

// NEW: import the tags-aware helper
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

// Extend the form to include tags as a string
interface I_FormFields extends Omit<I_QuestionUpdateMultipleChoiceRequestData, 'tags'> {
  tags: string
}

const Options: FC<{ data: I_AnswerMultipleChoiceDetail; reload: () => void }> = ({ data, reload }) => {
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
        { buttonLabel: sharedLabels.cancel, onPress: closeDialog, key: 'close' },
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

const MultipleChoiceEditForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = ({ data, reload }) => {
  const { content, difficulty, subject_id, tags: tagsFromData } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      subject_id,
      difficulty,
      tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? '')
    },
  })

  const submitWithTags = useProgressSubmit()
  const update = useQuestionMultipleChoiceUpdate()
  const backToList = useNavigateToQuestionBankList()

  const onSubmit: SubmitHandler<I_FormFields> = (formData) =>
    submitWithTags(
      formData,
      (f) => ({
        content: f.content,
        subject_id: f.subject_id!,
        difficulty: Number(f.difficulty),
        tags: f.tags,        // hook will normalize into semicolon format
      }),
      (wire) => update(data.id, wire),
      'Pregunta editada correctamente',
      () => backToList()
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <InputControlled<I_FormFields>
          control={control}
          name="difficulty"
          label="Dificultad (1-5)"
          type="number"
          rules={{
            ...rules.required(),
            min: { value: 1, message: 'Mínimo 1' },
            max: { value: 5, message: 'Máximo 5' },
          }}
          inputProps={{ min: 1, max: 5 }}
        />

        <SubjectOptions<I_FormFields> {...{ control }} name="subject_id" />

        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />

        {/* NEW TAG INPUT */}
        <InputControlled<I_FormFields>
          control={control}
          name="tags"
          label="Etiquetas"
        />
      </MagicGrid>

      <Spacer />

      <Options data={data.answer} reload={reload} />

      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default MultipleChoiceEditForm

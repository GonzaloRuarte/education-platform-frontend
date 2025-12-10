'use client'

import { useQuestionNumericUpdate, useNavigateToQuestionBankList } from '@/mta_questionbank/hooks'
import { numericLabels, questionLabels } from '@/mta_questionbank/labels'
import { I_AnswerNumericDetail, I_QuestionUpdateNumericRequestData, T_QuestionForm } from '@/mta_questionbank/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { sharedLabels } from '@/shared/labels'
import { SubmitHandler, useForm } from 'react-hook-form'

// ✅ tags + progress helper
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

// form fields: same as update request, but expose tags as a string for the UI
interface I_FormFields extends Omit<I_QuestionUpdateNumericRequestData, 'tags'> {
  tags: string
}

const NumericEditForm: T_QuestionForm<I_AnswerNumericDetail> = ({ data, reload }) => {
  const { content, answer, difficulty, subject_id, tags: tagsFromData } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      value: answer.value,
      subject_id,
      difficulty,
      tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? '') ,
    },
  })

  const backToDetail = useNavigateToQuestionBankList()
  const update = useQuestionNumericUpdate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (formData) =>
    submitWithTags(
      formData,
      (f) => ({
        content: f.content,
        value: Number(f.value),
        subject_id: f.subject_id as string,
        difficulty: Number(f.difficulty),
        tags: f.tags, // normalized by useProgressSubmit
      }),
      (wire) => update(data.id, wire),
      'Pregunta editada correctamente',
      () => backToDetail(),
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

        <InputControlled<I_FormFields>
          {...{ control }}
          label={numericLabels.value}
          rules={{ ...rules.required() }}
          name="value"
          type="number"
        />

        {/* ✅ new tags field */}
        <InputControlled<I_FormFields>
          control={control}
          name="tags"
          label="Etiquetas"
        />
      </MagicGrid>

      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default NumericEditForm

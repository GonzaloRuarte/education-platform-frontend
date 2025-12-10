'use client'

import { useNavigateToQuestionBankList, useQuestionNumericCreate } from '@/mta_questionbank/hooks'
import { numericLabels, questionLabels } from '@/mta_questionbank/labels'
import { I_AnswerNumericDetail, I_QuestionCreateNumericRequestData, T_QuestionForm } from '@/mta_questionbank/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { sharedLabels } from '@/shared/labels'
import { SubmitHandler, useForm } from 'react-hook-form'

// ✅ use the shared tags + progress helper
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

interface I_FormFields
  extends Omit<I_QuestionCreateNumericRequestData, 'subject_id' | 'tags'> {
  subject_id: I_QuestionCreateNumericRequestData['subject_id'] | null
  tags: string
}

const NumericCreateForm: T_QuestionForm<I_AnswerNumericDetail> = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content: '',
      value: 0,
      subject_id: null,
      difficulty: 1,
      tags: '',
    },
  })

  const backToDetail = useNavigateToQuestionBankList()
  const createNumeric = useQuestionNumericCreate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (data) =>
    submitWithTags(
      data,
      (f) => ({
        content: f.content,
        value: Number(f.value),
        subject_id: f.subject_id as string,
        difficulty: Number(f.difficulty),
        tags: f.tags, // will be normalized by useProgressSubmit
      }),
      (wire) => createNumeric(wire),
      'Pregunta agregada correctamente',
      backToDetail,
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

        {/* ✅ New tags field */}
        <InputControlled<I_FormFields>
          control={control}
          name="tags"
          label="Etiquetas"
        />
      </MagicGrid>

      <Spacer />

      <Submit>{sharedLabels.add}</Submit>
    </form>
  )
}

export default NumericCreateForm

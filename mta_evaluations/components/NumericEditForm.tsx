// NumericEditForm.tsx
'use client'

import { SubmitHandler, useForm } from 'react-hook-form'
import { I_AnswerNumericDetail, T_QuestionForm } from '@/mta_evaluations/types'
import { useQuestionNumericUpdate } from '@/mta_evaluations/hooks'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import Spacer from '@/shared/components/Spacer'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { numericLabels } from '@/mta_evaluations/labels'
import { sharedLabels } from '@/shared/labels'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'
import MagicGrid from '@/shared/components/MagicGrid'


type I_FormFields = { content: string; value: number; tags: string, section_title: string | null, section_close: boolean }

const NumericEditForm: T_QuestionForm<I_AnswerNumericDetail> = ({
  data,
  onSuccess,
  onCancel
}) => {
  const { content, answer, tags: tagsFromData, section_title, section_close } = data
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { content, value: answer.value, tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? ''), section_title: section_title ?? null, section_close: section_close ?? false },
  })

  const update = useQuestionNumericUpdate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (f) =>
    submitWithTags(
      f,
      (g) => ({ content: g.content, value: g.value, tags: g.tags, section_title: g.section_title, section_close: g.section_close }),
      (wire) => update(data.id, wire),
      'Pregunta numérica editada correctamente',
      onSuccess,
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <QuestionBaseFields<I_FormFields> control={control} />
        <InputControlled<I_FormFields>
          {...{ control }}
          label={numericLabels.value}
          rules={{ ...rules.required() }}
          name="value"
          type="number"
        />
      </MagicGrid>
      <Spacer />
      <FormActions submitLabel={sharedLabels.update} onCancel={onCancel} cancelLabel={sharedLabels.cancel} />
    </form>
  )
}

export default NumericEditForm

// NumericCreateForm.tsx
'use client'

import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { I_QuestionCreateNumericRequestData, T_EvaluationPageId } from '@/mta_evaluations/types'
import { useQuestionNumericCreate } from '@/mta_evaluations/hooks'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import Spacer from '@/shared/components/Spacer'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { numericLabels } from '@/mta_evaluations/labels'
import { sharedLabels } from '@/shared/labels'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'
import MagicGrid from '@/shared/components/MagicGrid'

type I_FormFields = { content: string; value: number | ''; tags: string, section_title: string | null }

const NumericCreateForm: FC<{ page_id: T_EvaluationPageId; onSuccess: () => void; onCancel?: () => void }> = ({
  page_id,
  onSuccess,
  onCancel,
}) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { content: '', value: '', tags: '', section_title: null } })
  const create = useQuestionNumericCreate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (data) =>
    submitWithTags(
      data,
      (f) => ({ content: f.content, value: Number(f.value), page_id, tags: f.tags, section_title: f.section_title }),
      (wire) => create(wire as I_QuestionCreateNumericRequestData),
      'Pregunta numérica agregada correctamente',
      onSuccess,
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* reuse content + tags layout but with a numeric input */}
      <MagicGrid>
        <QuestionBaseFields<I_FormFields> control={control} />
        <InputControlled<I_FormFields>
          {...{ control }}
          name="value"
          label={numericLabels.value}
          type="number"
          rules={{ ...rules.required() }}
        />
        {/* Tags already included via QuestionBaseFields; remove if you prefer value to sit between */}
      </MagicGrid>
      <Spacer />
      <FormActions submitLabel={sharedLabels.add} onCancel={onCancel} cancelLabel={sharedLabels.cancel} />
    </form>
  )
}

export default NumericCreateForm

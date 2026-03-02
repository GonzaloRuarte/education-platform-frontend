// MultipleChoiceCreateForm.tsx
'use client'

import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { I_QuestionCreateMultipleChoiceRequestData, T_EvaluationPageId } from '@/mta_evaluations/types'
import { useQuestionMultipleChoiceCreate } from '@/mta_evaluations/hooks'
import Spacer from '@/shared/components/Spacer'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'
import { sharedLabels } from '@/shared/labels'

type I_FormFields = Omit<I_QuestionCreateMultipleChoiceRequestData, 'page_id' | 'tags'> & { tags: string, section_title: string | null, section_close: boolean }

interface Props {
  page_id: T_EvaluationPageId
  onSuccess: () => void
  onCancel?: () => void
}

const MultipleChoiceCreateForm: FC<Props> = ({ page_id, onSuccess, onCancel }) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { content: '', tags: '', section_title: null, section_close: false } })
  const create = useQuestionMultipleChoiceCreate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (data) =>
    submitWithTags(
      data,
      (f) => ({ content: f.content, page_id, tags: f.tags, section_title: f.section_title, section_close: f.section_close }),
      (wire) => create(wire),
      'Pregunta de opción múltiple agregada correctamente',
      onSuccess,
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <QuestionBaseFields<I_FormFields> control={control} />
      <Spacer />
      <FormActions submitLabel={sharedLabels.add} onCancel={onCancel} cancelLabel={sharedLabels.cancel} />
    </form>
  )
}

export default MultipleChoiceCreateForm

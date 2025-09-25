// OpenEndedCreateForm.tsx
'use client'
import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { I_QuestionCreateOpenEndedRequestData, T_EvaluationPageId } from '@/mta_evaluations/types'
import { useQuestionOpenEndedCreate } from '@/mta_evaluations/hooks'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import Spacer from '@/shared/components/Spacer'
import { sharedLabels } from '@/shared/labels'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

type I_FormFields = { content: string; tags: string }

const OpenEndedCreateForm: FC<{ page_id: T_EvaluationPageId; onSuccess: () => void; onCancel?: () => void }> = ({
  page_id,
  onSuccess,
  onCancel,
}) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { content: '', tags: '' } })
  const create = useQuestionOpenEndedCreate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (data) =>
    submitWithTags(
      data,
      (f) => ({ content: f.content, page_id, tags: f.tags }),
      (wire) => create(wire as I_QuestionCreateOpenEndedRequestData),
      'Pregunta de texto libre agregada correctamente',
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

export default OpenEndedCreateForm

// OpenEndedEditForm.tsx
'use client'

import { SubmitHandler, useForm } from 'react-hook-form'
import { I_AnswerOpenEndedDetail, T_QuestionForm } from '@/mta_evaluations/types'
import { useQuestionOpenEndedUpdate } from '@/mta_evaluations/hooks'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import Spacer from '@/shared/components/Spacer'
import { sharedLabels } from '@/shared/labels'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

type I_FormFields = { content: string; tags: string }

const OpenEndedEditForm: T_QuestionForm<I_AnswerOpenEndedDetail> = ({
  data,
  onSuccess,
  onCancel,
}) => {
  const { content, tags: tagsFromData } = data
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { content, tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? '') },
  })

  const update = useQuestionOpenEndedUpdate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (f) =>
    submitWithTags(
      f,
      (g) => ({ content: g.content, tags: g.tags }),
      (wire) => update(data.id, wire),
      'Pregunta de texto libre editada correctamente',
      onSuccess,
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <QuestionBaseFields<I_FormFields> control={control} />
      <Spacer />
      <FormActions submitLabel={sharedLabels.update} onCancel={onCancel} cancelLabel={sharedLabels.cancel} />
    </form>
  )
}

export default OpenEndedEditForm

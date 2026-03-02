// MultipleChoiceEditForm.tsx
'use client'

import { useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { I_AnswerMultipleChoiceDetail, T_QuestionForm } from '@/mta_evaluations/types'
import { useQuestionMultipleChoiceUpdate } from '@/mta_evaluations/hooks'
import Spacer from '@/shared/components/Spacer'
import QuestionBaseFields from '@/mta_evaluations/components/QuestionBaseFields'
import FormActions from '@/mta_evaluations/components/FormActions'
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'
import { sharedLabels } from '@/shared/labels'
import { H4 } from '@/shared/components/Typography'
import { AddButton } from '@/shared/components/buttons'
import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import OptionDraftForm from '@/mta_evaluations/components/OptionDraftForm'
import { useDialog } from '@/shared/dialogs'
import SpacerCmp from '@/shared/components/Spacer'
import { Box } from '@mui/material'
import { diffOptions } from '@/mta_evaluations/utils/diffOptions'

type I_FormFields = { content: string; tags: string, section_title: string | null, section_close: boolean }

const MultipleChoiceEditForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = ({
  data,
  onSuccess,
  onCancel
}) => {
  const { content, answer, tags: tagsFromData, section_title, section_close } = data
  const [options, setOptions] = useState(answer.options)
  const originalOptionsRef = useRef(answer.options)

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { content, tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? ''), section_title: section_title ?? null, section_close: section_close ?? false },
  })

  const update = useQuestionMultipleChoiceUpdate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (f) => {
    const { toCreate, toDelete, toUpdate } = diffOptions(originalOptionsRef.current, options)
    return submitWithTags(
      f,
      (g) => ({
        content: g.content,
        tags: g.tags,
        options_ops: {
          create: toCreate,        // no id
          update: toUpdate,        // with id
          delete: toDelete,        // ids
        },
        section_title: g.section_title,
        section_close: g.section_close,
      }),
      (wire) => update(data.id, wire),
      'Pregunta editada correctamente',
      onSuccess,
    )
  }

  // tiny local Options UI kept as-is
  const { DialogComponent, componentProps, showDialog, closeDialog } = useDialog()
  const handleAddOption = () =>
    showDialog({
      title: 'Agregar Opción',
      content: <OptionDraftForm onCreate={(opt) => { setOptions((p) => [...p, opt]); closeDialog() }} />,
      actions: [],
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <QuestionBaseFields<I_FormFields> control={control} />
      <Spacer />
      <Box maxWidth="md">
        <H4>Opciones <AddButton size="small" variant="outlined" onClick={handleAddOption} /></H4>
        <SpacerCmp />
        {options.map((o, idx) => (
          <MultipleChoiceOption
            key={o.id}
            data={o}
            onDelete={() => setOptions((prev) => prev.filter((x) => x.id !== o.id))}
            onToggleTrue={(v) => setOptions((prev) => prev.map((x, i) => (i === idx ? { ...x, is_true: v } : x)))}
            withDelete
          />
        ))}
      </Box>
      <DialogComponent {...componentProps} />
      <Spacer />
      <FormActions submitLabel={sharedLabels.update} onCancel={onCancel} cancelLabel={sharedLabels.cancel} />
    </form>
  )
}

export default MultipleChoiceEditForm

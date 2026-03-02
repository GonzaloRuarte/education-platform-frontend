'use client'

import MagicGrid from '@/shared/components/MagicGrid'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import InputControlled from '@/shared/forms/InputControlled'
import ToggleControlled from '@/shared/forms/ToggleControlled'
import { rules } from '@/shared/forms/messages'
import { questionLabels } from '@/mta_evaluations/labels'
import { TagsFieldControlled } from '@/mta_evaluations/components/Tags'
import type { Control, FieldValues, Path } from 'react-hook-form'

type Props<T extends FieldValues> = {
  control: Control<T>
  contentName?: Path<T>
  tagsName?: Path<T>
  section_title?: Path<T>
  section_close?: Path<T>
  canCloseSection?: boolean
}

export default function QuestionBaseFields<T extends FieldValues>({
  control,
  contentName,
  tagsName,
  section_title,
  section_close,
}: Props<T>) {
  const contentKey = (contentName ?? ('content' as Path<T>))
  const tagsKey = (tagsName ?? ('tags' as Path<T>))
  const sectionTitleKey = (section_title ?? ('section_title' as Path<T>))
  const sectionCloseKey = (section_close ?? ('section_close' as Path<T>))

  // Watch title to decide whether to show close toggle (keeps UI clean)

  return (
    <MagicGrid>
      <WysiwygEditorControlled<T>
        control={control}
        name={contentKey}
        label={questionLabels.content}
        rules={{ ...rules.required() }}
      />

      <TagsFieldControlled<T> control={control} name={tagsKey} />

      {/* Optional: section header title */}
      <InputControlled<T>
        control={control}
        name={sectionTitleKey}
        label="Título de sección (opcional)"
        helperText="Si lo completás, se muestra como encabezado antes de esta pregunta."
      />

      {/* Optional: close toggle (only shown when title is set) */}

      <ToggleControlled<T>
        control={control}
        name={sectionCloseKey}
        label="Cerrar sección después de esta pregunta"
        helperText="Cierra la sección actualmente abierta (iniciada en una pregunta anterior o en esta)."
      />

    </MagicGrid>
  )
}
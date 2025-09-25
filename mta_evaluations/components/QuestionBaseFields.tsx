'use client'

import MagicGrid from '@/shared/components/MagicGrid'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { rules } from '@/shared/forms/messages'
import { questionLabels } from '@/mta_evaluations/labels'
import {TagsFieldControlled} from '@/mta_evaluations/components/Tags'
import type { Control, FieldValues, Path } from 'react-hook-form'

type Props<T extends FieldValues> = {
  control: Control<T>
  contentName?: Path<T>
  tagsName?: Path<T>
}

export default function QuestionBaseFields<T extends FieldValues>({
  control,
  contentName,
  tagsName,
}: Props<T>) {
  const contentKey = (contentName ?? ('content' as Path<T>))
  const tagsKey = (tagsName ?? ('tags' as Path<T>))

  return (
    <MagicGrid>
      <WysiwygEditorControlled<T>
        control={control}
        name={contentKey}
        label={questionLabels.content}
        rules={{ ...rules.required() }}
      />
      <TagsFieldControlled<T> control={control} name={tagsKey} />
    </MagicGrid>
  )
}
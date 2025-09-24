'use client'

import { useQuestionOpenEndedUpdate } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import { I_AnswerOpenEndedDetail, I_QuestionUpdateOpenEndedRequestData, T_QuestionForm } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Button from '@/shared/components/Button'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'
import { parseTags, findFirstInvalid, normalizeTagsForTransport } from '@/mta_evaluations/components/Tags'
interface I_FormFields extends Omit<I_QuestionUpdateOpenEndedRequestData, 'tags'> {
  tags: string
}

const OpenEndedEditForm: T_QuestionForm<I_AnswerOpenEndedDetail> = ({ data, onSuccess, onCancel }) => {
  const { content, tags: tagsFromData } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? ''),
    },
  })

  const { setInProgressStatus } = useInProgress()

  const update = useQuestionOpenEndedUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    let tagsSemicolon = ''
    try {
      tagsSemicolon = normalizeTagsForTransport(updatedData.tags)
    } catch (err) {
      handleServiceError(err)
      setInProgressStatus(false)
      return
    }
    update(data.id, { ...updatedData, tags: tagsSemicolon })
      .then(() => {
        successToast('Pregunta de texto libre editada correctamente')
        onSuccess()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />
        <InputControlled<I_FormFields>
          {...{ control }}
          name="tags"
          label="Etiquetas"
          placeholder="ej: algebra; ecuaciones; 2025"
          title="Separá las etiquetas con ; , o espacio. Solo letras y números."
          rules={{
            validate: (value: string) => {
              if (!value?.trim()) return true // optional
              const arr = parseTags(value)
              const bad = findFirstInvalid(arr)
              if (bad) return `Etiqueta inválida: "${bad}". Solo letras y números.`
              return true
            },
          }}
        />
      </MagicGrid>

      <Spacer />

      <MagicGrid itemSize="auto">
        <Submit>{sharedLabels.update}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
      </MagicGrid>
    </form>
  )
}

export default OpenEndedEditForm

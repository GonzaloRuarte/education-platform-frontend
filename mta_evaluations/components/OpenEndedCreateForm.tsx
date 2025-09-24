'use client'

import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  I_QuestionCreateOpenEndedRequestData,
  T_EvaluationPageId,
} from '@/mta_evaluations/types'
import {
  useQuestionOpenEndedCreate,
} from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { parseTags, findFirstInvalid, normalizeTagsForTransport } from '@/mta_evaluations/components/Tags'
interface I_FormFields
  extends Omit<I_QuestionCreateOpenEndedRequestData, 'page_id' | 'tags'> {
  tags: string
}

interface Props {
  /** evaluation_page_id in the DB */
  page_id: T_EvaluationPageId
  /** optional callbacks so the parent dialog can decide UX */
  onSuccess: () => void
  onCancel?: () => void
}

const OpenEndedCreateForm: FC<Props> = ({ page_id, onSuccess, onCancel }) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { content: '', tags: '' },
  })

  const { setInProgressStatus, setIsNotInProgress } = useInProgress()
  const createOpenEnded = useQuestionOpenEndedCreate()
  // even if you don’t navigate any more, leave this for legacy callers


  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    let tagsSemicolon = ''
    try {
      tagsSemicolon = normalizeTagsForTransport(data.tags)
    } catch (err) {
      handleServiceError(err)
      setIsNotInProgress()
      return
    }
    const payload: I_QuestionCreateOpenEndedRequestData = {
      content: data.content,
      page_id,
      tags: tagsSemicolon,
    }

    createOpenEnded(payload)
      .then(() => {
        successToast('Pregunta de texto libre agregada correctamente')
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
          name="content"
          label={questionLabels.content}
          rules={{ ...rules.required() }}
        />
        <InputControlled<I_FormFields>
          {...{ control }}
          name="tags"
          label="Etiquetas"
          placeholder="ej: algebra; ecuaciones; 2025"
          title="Separá las etiquetas con ; , o espacio. Solo letras y números."
          rules={{
            validate: (value: string) => {
              if (!value?.trim()) return true  // allow empty
              const tags = parseTags(value)
              const bad = findFirstInvalid(tags)
              if (bad) return `Etiqueta inválida: "${bad}". Solo letras y números.`
              return true
            }
          }}
        />
      </MagicGrid>

      <Spacer />

      <MagicGrid itemSize="auto">
        <Submit>{sharedLabels.add}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
      </MagicGrid>
    </form>
  )
}

export default OpenEndedCreateForm

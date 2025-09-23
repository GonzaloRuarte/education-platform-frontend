'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import {
  useEvaluationUpdate,
  useNavigateToEvaluationContentEdit,
} from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { I_EvaluationCreateRequestData, I_EvaluationDetail } from '@/mta_evaluations/types'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'
import { parseTags, findFirstInvalid, normalizeTagsForTransport } from '@/mta_evaluations/components/Tags'

// NOTE: omit 'subject_id' AND 'tags' since tags is a string in the form
interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id' | 'tags'> {
  subject_id: I_EvaluationCreateRequestData['subject_id'] | null
  tags: string   // <- UI string
}

interface I_Props {
  data: I_EvaluationDetail
}

const EvaluationEditForm = ({ data }: I_Props) => {
  const { title, code, header, status, subject_id, grade, tags: tagsFromData } = data
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      title,
      code,
      header,
      status,
      subject_id,
      grade,
      // If backend/detail returns an array, display as a semicolon string
      // If it already returns a string, this still works.
      tags: Array.isArray(tagsFromData) ? tagsFromData.join(';') : (tagsFromData ?? ''),
    },
  })

  const { setInProgressStatus } = useInProgress()
  const evaluationUpdate = useEvaluationUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = ({ tags, ...updatedData }) => {
    setInProgressStatus(true)

    // Optional field: only parse/validate if non-empty
    let tagsSemicolon = ''
    try {
      tagsSemicolon = normalizeTagsForTransport(tags)
    } catch (err) {
      handleServiceError(err)
      setInProgressStatus(false)
      return
    }

    evaluationUpdate(data.id, {
      ...updatedData,
      subject_id: updatedData.subject_id as string,
      tags: tagsSemicolon, // "" if user cleared the field
    })
      .then(() => {
        successToast('Evaluación editada correctamente')
        navigateToEvaluationContentEdit({ evaluationId: data.id })
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <InputControlled<I_FormFields>
          {...{ control }}
          name="title"
          rules={{ ...rules.required() }}
          label={evaluationLabels.title}
        />
        <InputControlled<I_FormFields>
          {...{ control }}
          name="code"
          title="El código de la evaluación no se puede editar"
          rules={{ ...rules.required() }}
          label={evaluationLabels.code}
          disabled
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
        <SubjectOptions<I_FormFields> {...{ control }} name="subject_id" />
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={evaluationLabels.header}
          rules={{ ...rules.required() }}
          name="header"
        />
        <SchoolGradeSelectControlled
          control={control}
          name="grade"
          rules={{ ...rules.required() }}
        />
      </MagicGrid>
      <Spacer />
      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default EvaluationEditForm

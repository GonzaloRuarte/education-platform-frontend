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
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id'> {
  subject_id: I_EvaluationCreateRequestData['subject_id'] | null
}

interface I_Props {
  data: I_EvaluationDetail
}

const EvaluationEditForm = ({ data }: I_Props) => {
  const { title, code, header, status, subject_id, grade } = data
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      title,
      code,
      header,
      status,
      subject_id,
      grade,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const evaluationUpdate = useEvaluationUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = ({ ...updatedData }) => {
    setInProgressStatus(true)
    evaluationUpdate(data.id, {
      ...updatedData,
      subject_id: updatedData.subject_id as string,
    })
      .then((res) => {
        log.info('New Evaluation added:', res)
        successToast('Evaluación editada correctamente')
        navigateToEvaluationContentEdit({ evaluationId: data.id })
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
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
        <SubjectOptions {...{ control }} name="subject_id" />
        <WysiwygEditorControlled
          {...{ control }}
          label={evaluationLabels.header}
          rules={{ ...rules.required() }}
          name="header"
        />
        <SchoolGradeSelectControlled control={control} name="grade" rules={{ ...rules.required() }} />

      </MagicGrid>
      <Spacer />
      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default EvaluationEditForm

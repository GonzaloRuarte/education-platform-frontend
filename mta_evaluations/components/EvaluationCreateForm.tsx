'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import {
  useEvaluationCreate,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationList,
} from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationCreateRequestData } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id'> {
  subject_id: I_EvaluationCreateRequestData['subject_id'] | null
}

const defaultValues: I_FormFields = {
  title: '',
  code: '',
  header: '',
  status: EvaluationStatus.Draft,
  subject_id: null,
}
const EvaluationCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setInProgressStatus } = useInProgress()
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()
  const evaluationCreate = useEvaluationCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    evaluationCreate({ ...data, subject_id: data.subject_id as string })
      .then((res) => {
        log.info('New Evaluation added:', res)
        successToast('Evaluación agregada correctamente')
        navigateToEvaluationContentEdit({ evaluationId: res.id })
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
          rules={{ ...rules.required() }}
          label={evaluationLabels.code}
        />
        <SubjectOptions<I_FormFields> {...{ control }} name="subject_id" />
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={evaluationLabels.header}
          rules={{ ...rules.required() }}
          name="header"
        />
      </MagicGrid>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default EvaluationCreateForm

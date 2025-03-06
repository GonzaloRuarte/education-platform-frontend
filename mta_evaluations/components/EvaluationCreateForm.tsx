'use client'

import { useEvaluationCreate } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationCreateRequestData } from '@/mta_evaluations/types'
import { useNavigateToSchoolList, useSchoolCreate } from '@/mta_schools/hooks'
import Input from '@/shared/forms/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id'> {
  subject_id?: I_EvaluationCreateRequestData['subject_id']
}

const defaultValues: I_FormFields = {
  title: '',
  code: '',
  header: '',
  status: EvaluationStatus.Draft,
  subject_id: undefined,
}
const EvaluationCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setIsInProgress } = useInProgress()
  const navigateToSchoolList = useNavigateToSchoolList()
  const evaluationCreate = useEvaluationCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    evaluationCreate(data)
      .then((res) => {
        log.info('New school added:', res)

        successToast('Evaluación agregada correctamente')
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Input<I_FormFields> control={control} name="title" rules={{ ...rules.required() }} label={evaluationLabels.title} />
        <Input<I_FormFields> control={control} name="header" type="text" rules={{ ...rules.required() }} label={evaluationLabels.header} />

        <Input<I_FormFields> control={control} type="text" name="district" rules={{ ...rules.required() }} label="Distrito" />
      </MagicGrid>

      <Submit>Agregar</Submit>
    </form>
  )
}

export default EvaluationCreateForm

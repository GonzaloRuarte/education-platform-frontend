'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { useEvaluationCreate, useEvaluationSubjects, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationCreateRequestData, I_EvaluationSubject } from '@/mta_evaluations/types'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import { SchoolGrade } from '@/mta_schools/constants'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Input from '@/shared/forms/Input'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { randomInt } from '@/shared/utils'
import { useMemo } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id' | 'grade' | 'code'> {
  subject_id: I_EvaluationCreateRequestData['subject_id'] | null
  grade: I_EvaluationCreateRequestData['grade'] | null
}

const defaultValues: I_FormFields = {
  title: '',
  // code: '',
  header: '',
  status: EvaluationStatus.Draft,
  subject_id: null,
  grade: null,
}
const EvaluationCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const subject_id = useWatch({ control, name: 'subject_id' })
  const grade = useWatch({ control, name: 'grade' })
  const subjects = useEvaluationSubjects()

  const code = useMemo(() => {
    if (subjects === undefined || subject_id === null || grade === null) return ''
    const subject_prefix = (subjects.find((s) => s.id === subject_id) as I_EvaluationSubject).prefix
    return `${subject_prefix}${grade}_${new Date().getFullYear()}_${randomInt(10000, 99999)}`
  }, [subject_id, grade, subjects])

  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const navigateToEvaluationContentEdit = useNavigateToEvaluationContentEdit()
  const evaluationCreate = useEvaluationCreate()
  const onSubmit: SubmitHandler<I_FormFields> = ({  ...data }) => {
    setIsInProgress()
    evaluationCreate({
      ...data,
      code,
      subject_id: data.subject_id as string,
      grade: data.grade as SchoolGrade,
    })
      .then((res) => {
        log.info('New Evaluation added:', res)
        successToast('Evaluación agregada correctamente')
        navigateToEvaluationContentEdit({ evaluationId: res.id })
      })
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
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
        <SchoolGradeSelectControlled control={control} name="grade" rules={{ ...rules.required() }} />
        <SubjectOptions<I_FormFields> {...{ control }} name="subject_id" />
        <Input name="code" label={evaluationLabels.code} disabled value={code} title="El código de la evaluación se genera automáticamente" />
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

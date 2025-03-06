'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { useEvaluationCreate, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus, I_EvaluationCreateRequestData, I_EvaluationDetail } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { Body1, Body2, H1, H3 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Paper } from '@mui/material'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_EvaluationCreateRequestData, 'subject_id'> {
  subject_id: I_EvaluationCreateRequestData['subject_id'] | null
}

interface I_Props {
  data: I_EvaluationDetail
}
const EvaluationContentEditForm = ({ data }: I_Props) => {
  const { title, code, header, status, subject_id } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      title,
      code,
      header,
      status,
      subject_id,
    },
  })

  const { setIsInProgress } = useInProgress()
  const navigateToEvaluationList = useNavigateToEvaluationList()
  const evaluationCreate = useEvaluationCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    evaluationCreate({ ...data, subject_id: data.subject_id as string })
      .then((res) => {
        log.info('New Evaluation added:', res)
        successToast('Evaluación agregada correctamente')
        navigateToEvaluationList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Paper variant="elevation" style={{ padding: 20 }}>
          <H3>{title}</H3>
          <Body1>{subject_id}</Body1>
          <Body2>{header}</Body2>
        </Paper>
        {/* <Input<I_FormFields> {...{ control }} name="title" rules={{ ...rules.required() }} label={evaluationLabels.title} /> */}
        {/* <Input<I_FormFields> {...{ control }} name="code" rules={{ ...rules.required() }} label={evaluationLabels.code} /> */}
        {/* <SubjectOptions {...{ control }} name="subject_id" /> */}
        {/* <WysiwygEditor {...{ control }} label={evaluationLabels.header} rules={{ ...rules.required() }} name="header" /> */}
      </MagicGrid>
    </form>
  )
}

export default EvaluationContentEditForm

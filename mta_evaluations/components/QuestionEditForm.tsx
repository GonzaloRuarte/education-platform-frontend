'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { useEvaluationUpdate, useNavigateToEvaluationList } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import { I_EvaluationCreateRequestData, I_EvaluationDetail, I_QuestionDetail, I_QuestionEditRequestData } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Input from '@/shared/forms/Input'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_QuestionEditRequestData {}

interface I_Props {
  data: I_QuestionDetail
}
const QuestionEditForm = ({ data }: I_Props) => {
  const { answer, content, id, is_mandatory } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
    },
  })

  const { setIsInProgress } = useInProgress()
  const navigateToEvaluationList = useNavigateToEvaluationList()
  const evaluationUpdate = useEvaluationUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    // setIsInProgress(true)
    // evaluationUpdate(data.id, { ...updatedData, subject_id: updatedData.subject_id as string })
    //   .then((res) => {
    //     log.info('New Evaluation added:', res)
    //     successToast('Evaluación editada correctamente')
    //     navigateToEvaluationList()
    //   })
    //   .catch(handleServiceError)
    //   .finally(() => {
    //     setIsInProgress(false)
    //   })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        {/* <Input<I_FormFields> {...{ control }} name="title" rules={{ ...rules.required() }} label={questionLabels.title} /> */}
        {/* <Input<I_FormFields> {...{ control }} name="code" rules={{ ...rules.required() }} label={questionLabels.code} /> */}
        {/* <SubjectOptions {...{ control }} name="subject_id" /> */}
        <WysiwygEditor<I_FormFields> {...{ control }} label={questionLabels.content} rules={{ ...rules.required() }} name="content" />
      </MagicGrid>
      <Spacer />
      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default QuestionEditForm

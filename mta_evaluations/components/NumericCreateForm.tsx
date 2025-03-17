'use client'

import { useNavigateToEvaluationContentEdit, useQuestionNumericCreate } from '@/mta_evaluations/hooks'
import { numericLabels, questionLabels } from '@/mta_evaluations/labels'
import { I_AnswerNumericDetail, I_QuestionCreateNumericRequestData, T_QuestionForm } from '@/mta_evaluations/types'
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
import { useParams } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_QuestionCreateNumericRequestData, 'evaluation_id'> {}

const NumericCreateForm: T_QuestionForm<I_AnswerNumericDetail> = () => {
  const { evaluationId } = useParams()

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content: '',
      value: undefined,
    },
  })

  const { setIsInProgress } = useInProgress()
  const backToDetail = useNavigateToEvaluationContentEdit()
  const createNumeric = useQuestionNumericCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    const payload = {
      content: data.content,
      value: Number(data.value),
      evaluation_id: Number(evaluationId),
    }
    console.log({ payload })

    createNumeric(payload)
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        backToDetail({ evaluationId: Number(evaluationId) })
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <WysiwygEditor<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />
        <Input<I_FormFields>
          {...{ control }}
          label={numericLabels.value}
          rules={{ ...rules.required() }}
          name="value"
          type="number"
        />
      </MagicGrid>
      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default NumericCreateForm

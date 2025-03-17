'use client'

import { useNavigateToQuestionEdit, useQuestionMultipleChoiceCreate } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import {
  I_AnswerMultipleChoiceDetail,
  I_QuestionCreateMultipleChoiceRequestData,
  T_QuestionForm,
} from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1 } from '@/shared/components/Typography'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { useParams } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_QuestionCreateMultipleChoiceRequestData, 'evaluation_id'> {}

const MultipleChoiceCreateForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = () => {
  const { evaluationId } = useParams()

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content: '',
    },
  })
  const { setIsInProgress } = useInProgress()

  const navigateToDetail = useNavigateToQuestionEdit()
  const create = useQuestionMultipleChoiceCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    create({ ...data, evaluation_id: Number(evaluationId) })
      .then((res) => {
        log.info('Question created succesfully:')
        successToast('Pregunta multiple choice agregada correctamente')
        navigateToDetail({ evaluationId: res.evaluation_id, questionId: res.question_id })
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
      </MagicGrid>
      <Spacer />

      <MagicGrid itemSize="auto">
        <Submit>{sharedLabels.add}</Submit>
        <Body1>
          Nota: Una vez creado el encabezado de la pregunta, podrá agregar opciones para el multiple choice.
        </Body1>
      </MagicGrid>
      <Spacer />
    </form>
  )
}

export default MultipleChoiceCreateForm

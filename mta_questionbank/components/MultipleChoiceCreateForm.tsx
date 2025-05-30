'use client'

import { useNavigateToQuestionEdit, useQuestionMultipleChoiceCreate } from '@/mta_questionbank/hooks'
import { questionLabels } from '@/mta_questionbank/labels'
import {
  I_AnswerMultipleChoiceDetail,
  I_QuestionCreateMultipleChoiceRequestData,
  T_QuestionForm,
} from '@/mta_questionbank/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1 } from '@/shared/components/Typography'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_QuestionCreateMultipleChoiceRequestData, 'subject_id'> {
  subject_id: I_QuestionCreateMultipleChoiceRequestData['subject_id'] | null
}

const MultipleChoiceCreateForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = () => {

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content: '',
      subject_id: null,
      difficulty: 1
    },
  })
  const { setInProgressStatus } = useInProgress()

  const navigateToDetail = useNavigateToQuestionEdit()
  const create = useQuestionMultipleChoiceCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    const payload =
      {
        content: data.content,
        subject_id: data.subject_id as string,
        difficulty: Number(data.difficulty),
      }
    create(payload)
      .then((res) => {
        log.info('Question created succesfully:')
        successToast('Pregunta de opción múltiple agregada correctamente')
        navigateToDetail({ questionId: res.question_id })
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
          control={control}
          name="difficulty"
          label="Dificultad (1-5)"
          type="number"
          rules={{ 
            ...rules.required(), 
            min: { value: 1, message: 'Mínimo 1' }, 
            max: { value: 5, message: 'Máximo 5' } 
          }}
          inputProps={{ min: 1, max: 5 }}
        />

        <SubjectOptions<I_FormFields> {...{ control }} name="subject_id" />
        <WysiwygEditorControlled<I_FormFields>
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
          Nota: Una vez creado el encabezado de la pregunta, podrá agregar opciones.
        </Body1>
      </MagicGrid>
      <Spacer />
    </form>
  )
}

export default MultipleChoiceCreateForm

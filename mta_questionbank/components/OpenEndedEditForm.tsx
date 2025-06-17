'use client'

import { useQuestionOpenEndedUpdate, useNavigateToQuestionBankList } from '@/mta_questionbank/hooks'
import { questionLabels } from '@/mta_questionbank/labels'
import { I_AnswerOpenEndedDetail, I_QuestionUpdateOpenEndedRequestData, T_QuestionForm } from '@/mta_questionbank/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_QuestionUpdateOpenEndedRequestData {}

const OpenEndedEditForm: T_QuestionForm<I_AnswerOpenEndedDetail> = ({ data, reload }) => {
  const { content, difficulty, subject_id } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      subject_id: subject_id,
      difficulty: difficulty
    },
  })

  const { setInProgressStatus } = useInProgress()
  const backToDetail = useNavigateToQuestionBankList()
  const update = useQuestionOpenEndedUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    update(data.id, { ...updatedData })
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        backToDetail()
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

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default OpenEndedEditForm

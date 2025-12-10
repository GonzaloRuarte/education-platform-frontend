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
import { sharedLabels } from '@/shared/labels'
import { SubmitHandler, useForm } from 'react-hook-form'

// ✅ shared progress + tags helper
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

interface I_FormFields extends Omit<I_QuestionUpdateOpenEndedRequestData, 'tags'> {
  tags: string
}

const OpenEndedEditForm: T_QuestionForm<I_AnswerOpenEndedDetail> = ({ data, reload }) => {
  const { content, difficulty, subject_id } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      subject_id,
      difficulty,
      // adjust as needed to prefill existing tags
      tags: '',
    },
  })

  const backToDetail = useNavigateToQuestionBankList()
  const update = useQuestionOpenEndedUpdate()
  const submitWithTags = useProgressSubmit()

  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) =>
    submitWithTags(
      updatedData,
      (f) => ({
        content: f.content,
        subject_id: f.subject_id as string,
        difficulty: Number(f.difficulty),
        tags: f.tags,
      }),
      (wire) => update(data.id, wire),
      'Pregunta editada correctamente',
      () => backToDetail(),
    )

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
            max: { value: 5, message: 'Máximo 5' },
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

        {/* ✅ New tags field */}
        <InputControlled<I_FormFields>
          control={control}
          name="tags"
          label="Etiquetas"
          placeholder="ej: ensayo; comprensión lectora"
        />
      </MagicGrid>

      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default OpenEndedEditForm

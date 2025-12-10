// MultipleChoiceCreateForm in questionbank

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
import { sharedLabels } from '@/shared/labels'
import InputControlled from '@/shared/forms/InputControlled'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { SubmitHandler, useForm } from 'react-hook-form'

// ✅ NEW: reuse the progress+tags helper
import { useProgressSubmit } from '@/mta_evaluations/hooks/useProgressSubmit'

interface I_FormFields
  extends Omit<I_QuestionCreateMultipleChoiceRequestData, 'subject_id' | 'tags'> {
  subject_id: I_QuestionCreateMultipleChoiceRequestData['subject_id'] | null
  tags: string                                // ✅ plain string for the input
}

const MultipleChoiceCreateForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content: '',
      subject_id: null,
      difficulty: 1,
      tags: '',                               // ✅ start empty
    },
  })

  const navigateToDetail = useNavigateToQuestionEdit()
  const create = useQuestionMultipleChoiceCreate()
  const submitWithTags = useProgressSubmit()  // ✅ our helper

  const onSubmit: SubmitHandler<I_FormFields> = (data) =>
    submitWithTags(
      data,
      (f) => ({
        content: f.content,
        subject_id: f.subject_id as string,
        difficulty: Number(f.difficulty),
        tags: f.tags,                         // ✅ pass tags through; hook normalizes
      }),
      (wire) => create(wire),
      'Pregunta de opción múltiple agregada correctamente',
      (res) => {
        // ✅ we now have the mutation result here
        navigateToDetail({ questionId: res.question_id })
      },
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

        {/* ✅ simple tags input bound to the string that useProgressSubmit expects */}
        <InputControlled<I_FormFields>
          control={control}
          name="tags"
          label="Etiquetas"
          // you can add rules if needed (optional/required/format)
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

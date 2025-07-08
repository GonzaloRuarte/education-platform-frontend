'use client'

import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import  Submit  from '@/shared/components/Submit'
import { LetterSelectControlled } from '@/shared/forms/LetterSelect'
import Spacer from '@/shared/components/Spacer'

interface DraftFields {
  name: string
  content: string
  is_true: boolean
}

interface Props {
  onCreate: (o: DraftFields & { id: number }) => void
}

const OptionDraftForm: FC<Props> = ({ onCreate }) => {
  const { control, handleSubmit, register } = useForm<DraftFields>({
    defaultValues: { name: '', content: '', is_true: false },
  })

  const submit = handleSubmit((data) =>
    onCreate({
      ...data,
      id: -Date.now(), // temp negative id so it’s unique inside the modal
    }),
  )

  return (
    <form>
      <LetterSelectControlled control={control} name="name" rules={rules.required()} />

      <WysiwygEditorControlled<DraftFields>
        control={control}
        name="content"
        label="Contenido"
        rules={rules.required()}
      />
      <Spacer />

      <label>
        <input type="checkbox" {...register('is_true')} /> Es respuesta correcta
      </label>
      <Spacer />
      <Submit onClick={submit}>Agregar</Submit>
    </form>
  )
}

export default OptionDraftForm

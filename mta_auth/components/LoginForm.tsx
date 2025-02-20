'use client'

import Input from '@/shared/components/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { SubmitHandler, useForm } from "react-hook-form"

interface I_FormFields {
  user: string
  password: string
}
const defaultValues: I_FormFields = {
  user: '',
  password: ''
}


export default function LoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const onSubmit: SubmitHandler<I_FormFields> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Input<I_FormFields> control={control} name='user' rules={{ required: rules.required }} label='Usuario' />
        <Input<I_FormFields> control={control} type='password' name='password' rules={{ required: rules.required }} label='Contraseña' />
      </MagicGrid>

      <Submit>Ingresar</Submit>

    </form>
  )
}
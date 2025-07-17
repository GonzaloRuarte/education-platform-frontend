'use client'

import { useAuthorizeAndStore } from '@/mta_auth/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress, useNavigateToDashboardHome } from '@/shared/hooks'

import Spacer from '@/shared/components/Spacer'
import { SubmitHandler, useForm } from 'react-hook-form'
import PasswordInputControlled from '@/shared/components/PasswordField'

interface I_FormFields {
  username: string
  password: string
}

export default function DashboardLoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const navigateToHome = useNavigateToDashboardHome()
  const { authorize } = useAuthorizeAndStore()

  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress()
    authorize(data).then(navigateToHome).finally(setIsNotInProgress)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MagicGrid>
          <InputControlled<I_FormFields>
            control={control}
            name="username"
            rules={{ ...rules.required() }}
            label="Usuario"
          />
          <PasswordInputControlled<I_FormFields>
            control={control}
            name="password"
            rules={{ ...rules.required() }}
            label="Contraseña"
          />
        </MagicGrid>
        <Spacer />
        <Submit>Ingresar</Submit>
      </form>
    </>
  )
}

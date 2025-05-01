'use client'

import { useAuthorize, useStoreAuthData } from '@/mta_auth/hooks'
import InputControlled from '@/shared/forms/InputControlled'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress, useNavigateToDashboardHome } from '@/shared/hooks'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'
import Spacer from '@/shared/components/Spacer'

interface I_FormFields {
  username: string
  password: string
}
const defaultValues: I_FormFields = {
  username: '',
  password: '',
}

export default function DashboardLoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const navigateToHome = useNavigateToDashboardHome()
  const authorize = useAuthorize()
  const storeAuthData = useStoreAuthData()

  const { setInProgressStatus } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    authorize(data)
      .then((res) => {
        successToast('¡Sesión iniciada correctamente, bienvenido/a!')
        storeAuthData({ accessToken: res.token.access, refreshToken: res.token.refresh, profiles: res.user.profiles })
        navigateToHome()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
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
          <InputControlled<I_FormFields>
            control={control}
            type="password"
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

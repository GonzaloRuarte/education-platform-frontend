'use client'

import { useAuthorize, useStoreAuthData } from '@/mta_auth/hooks'
import Input from '@/shared/forms/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress, useNavigateToHome } from '@/shared/hooks'

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

export default function LoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const navigateToHome = useNavigateToHome()
  const authorize = useAuthorize()
  const storeAuthData = useStoreAuthData()

  const { setIsInProgress } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    authorize(data)
      .then((res) => {
        successToast('¡Sesión iniciada correctamente, bienvenido/a!')
        storeAuthData({ accessToken: res.access, refreshToken: res.refresh, accessGroups: ['admin'] })
        navigateToHome()
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MagicGrid>
          <Input<I_FormFields> control={control} name="username" rules={{ ...rules.required() }} label="Usuario" />
          <Input<I_FormFields>
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

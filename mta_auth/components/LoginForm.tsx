'use client'

import { useAuthorize, useStoreAuthData } from '@/mta_auth/hooks'
import Input from '@/shared/components/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { useRdHome } from '@/shared/navigation'
import { handleError } from '@/shared/service'
import { errorToast, successToast } from '@/shared/toasts'
import { Backdrop } from '@mui/material'
import { SubmitHandler, useForm } from "react-hook-form"

interface I_FormFields {
  username: string
  password: string
}
const defaultValues: I_FormFields = {
  username: '',
  password: ''
}


export default function LoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const rdHome = useRdHome()
  const authorize = useAuthorize()
  const storeAuthData = useStoreAuthData()

  const { isInProgress, setIsInProgress } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    authorize(data)
      .then(res => {
        successToast('¡Sesión iniciada correctamente, bienvenidx!')
        storeAuthData({ accessToken: res.access, refreshToken: res.refresh })
        rdHome()
      })
      .catch((err) => {
        errorToast('asd')
      })
      .finally(() => {
        setIsInProgress(false)
      })
  }

  return <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Input<I_FormFields> control={control} name='username' rules={{ required: rules.required }} label='Usuario' />
        <Input<I_FormFields> control={control} type='password' name='password' rules={{ required: rules.required }} label='Contraseña' />
      </MagicGrid>

      <Submit>Ingresar</Submit>

    </form>
    <Backdrop open={isInProgress} />
  </>

}
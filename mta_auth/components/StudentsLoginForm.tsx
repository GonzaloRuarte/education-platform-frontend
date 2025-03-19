'use client'

import { useAuthorizeStudent, useStoreAuthData } from '@/mta_auth/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import Input from '@/shared/forms/Input'
import { rules } from '@/shared/forms/messages'
import { useInProgress, useNavigateToHome } from '@/shared/hooks'

import { T_StudentProfilePersonalId } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  personal_id: T_StudentProfilePersonalId
}

export default function StudentsLoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { personal_id: undefined },
  })
  const navigateToHome = useNavigateToHome()
  const authorize = useAuthorizeStudent()
  const storeAuthData = useStoreAuthData()

  const { setIsInProgress } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    authorize(data)
      .then((res) => {
        successToast('¡Pudiste ingresar correctamente, bienvenido/a. ¡Suerte en tu Evaluación!')
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
          <Input<I_FormFields>
            control={control}
            name="personal_id"
            type="number"
            rules={{ ...rules.required() }}
            label="DNI"
          />
        </MagicGrid>
        <Spacer />
        <Submit>Comenzar</Submit>
      </form>
    </>
  )
}

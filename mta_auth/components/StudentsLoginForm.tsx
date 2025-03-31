'use client'

import { useStoreAuthData } from '@/mta_auth/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'

import { useNavigateToResolutionPage } from '@/mta_resolutions/hooks'
import { useResolutionAuthorizeStudent } from '@/mta_resolutions/hooks/data'
import { I_AuthorizeStudentRequestData } from '@/mta_resolutions/types'
import { T_StudentProfilePersonalId } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { useForm } from 'react-hook-form'

interface I_FormFields {
  personal_id: T_StudentProfilePersonalId | ''
}

export default function StudentsLoginForm() {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { personal_id: 35425196 } })
  const navigateToBeginResolution = useNavigateToResolutionPage()
  const authorize = useResolutionAuthorizeStudent()
  const storeAuthData = useStoreAuthData()

  const { setInProgressStatus } = useInProgress()
  const onSubmit = (data: I_AuthorizeStudentRequestData) => {
    setInProgressStatus(true)
    authorize(data)
      .then((res) => {
        successToast('¡Pudiste ingresar correctamente, bienvenido/a. ¡Suerte en tu Evaluación!')
        storeAuthData({ accessToken: res.access, refreshToken: res.refresh, accessGroups: ['admin'] })
        navigateToBeginResolution()
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

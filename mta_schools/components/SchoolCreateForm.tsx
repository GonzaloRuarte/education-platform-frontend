'use client'

import { useNavigateToSchoolList, useSchoolCreate } from '@/mta_schools/hooks'
import Input from '@/shared/components/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  name: string
  district: string
  contact_email: string
}
const defaultValues: I_FormFields = {
  name: '',
  district: '',
  contact_email: '',
}
const SchoolCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setIsInProgress } = useInProgress()
  const navigateToSchoolList = useNavigateToSchoolList()
  const schoolCreate = useSchoolCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    schoolCreate(data)
      .then((res) => {
        log.info('New school added:', res)

        successToast('Escuela agregada correctamente')
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Input<I_FormFields> control={control} name="name" rules={{ ...rules.required() }} label="Nombre" />
        <Input<I_FormFields> control={control} type="email" name="contact_email" label="E-Mail" />
        <Input<I_FormFields>
          control={control}
          type="text"
          name="district"
          rules={{ ...rules.required() }}
          label="Distrito"
        />
      </MagicGrid>

      <Submit>Agregar</Submit>
    </form>
  )
}

export default SchoolCreateForm

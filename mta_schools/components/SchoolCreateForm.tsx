'use client'

import { useNavigateToSchoolList, useSchoolCreate } from '@/mta_schools/hooks'
import InputControlled from '@/shared/forms/InputControlled'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'
import Spacer from '@/shared/components/Spacer'

interface I_FormFields {
  name: string
  district: string
  contact_email: string
  max_executives: number
}
const defaultValues: I_FormFields = {
  name: '',
  district: '',
  contact_email: '',
  max_executives: 20,
}
const SchoolCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToSchoolList()
  const schoolCreate = useSchoolCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    schoolCreate(data)
      .then((res) => {
        successToast('Escuela agregada correctamente')
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <InputControlled<I_FormFields> control={control} name="name" rules={{ ...rules.required() }} label="Nombre" />
        <InputControlled<I_FormFields> control={control} type="email" name="contact_email" label="E-Mail" />
        <InputControlled<I_FormFields>
          control={control}
          type="text"
          name="district"
          rules={{ ...rules.required() }}
          label="Distrito"
        />
        <InputControlled<I_FormFields>
          control={control}
          type="number"
          name="max_executives"
          rules={{ ...rules.required() }}
          label="Máximo de Responsables Ejecutivos"
        />
      </MagicGrid>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default SchoolCreateForm

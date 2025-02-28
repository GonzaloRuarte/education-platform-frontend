'use client'

import { useNavigateToSchoolList, useSchoolUpdate } from '@/mta_schools/hooks'
import { I_SchoolDetail, I_SchoolUpdateRequestData } from '@/mta_schools/types'
import Input from '@/shared/components/Input'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_SchoolUpdateRequestData {}

interface I_Props {
  data: I_SchoolDetail
}
const SchoolCreateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      ...data,
    },
  })

  const { setIsInProgress } = useInProgress()
  const navigateToSchoolList = useNavigateToSchoolList()
  const schoolUpdate = useSchoolUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setIsInProgress(true)
    schoolUpdate(data.id, updatedData)
      .then(() => {
        successToast('Escuela editada correctamente')
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

      <Submit>Guardar</Submit>
    </form>
  )
}

export default SchoolCreateForm

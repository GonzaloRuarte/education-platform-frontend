'use client'

import { useGroupingCreate, useNavigateToGroupingList } from '@/mta_schools/hooks'
import { I_GroupingCreateRequestData } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_GroupingCreateRequestData {}

const GroupingCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { name: '' } })
  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToGroupingList()
  const create = useGroupingCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then(() => {
        successToast('Agrupamiento agregado correctamente')
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputControlled<I_FormFields> control={control} name="name" rules={{ ...rules.required() }} label="Nombre" />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default GroupingCreateForm

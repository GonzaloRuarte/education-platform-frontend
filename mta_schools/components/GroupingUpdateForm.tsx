'use client'

import { GROUPING_NAME } from '@/mta_schools/constants'
import { useGroupingUpdate, useNavigateToGroupingList } from '@/mta_schools/hooks'
import { I_GroupingCreateRequestData, I_GroupingDetail } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_GroupingCreateRequestData {}
interface I_Props {
  data: I_GroupingDetail
}

const GroupingUpdateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues: { name: data.name } })
  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToGroupingList()
  const update = useGroupingUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (payload) => {
    setInProgressStatus(true)
    update(data.id, payload)
      .then(() => {
        successToast(sentence(`${GROUPING_NAME.singular} editado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputControlled<I_FormFields> control={control} name="name" rules={{ ...rules.required() }} label="Nombre" />
      <Spacer />
      <Submit>Guardar</Submit>
    </form>
  )
}

export default GroupingUpdateForm

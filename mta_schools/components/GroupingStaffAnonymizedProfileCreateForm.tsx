'use client'

import GroupingStaffProfileFormFields from '@/mta_schools/components/GroupingStaffProfileFormFields'
import { useGroupingStaffAnonymizedProfileCreate, useNavigateToGroupingStaffAnonymizedProfileList } from '@/mta_schools/hooks'
import { I_GroupingStaffProfileCreateRequestData, T_GroupingId } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_GroupingStaffProfileCreateRequestData {
  repeat_password: string
}

const GroupingStaffAnonymizedProfileCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      grouping_id: undefined as unknown as T_GroupingId,
      username: '',
      password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToGroupingStaffAnonymizedProfileList()
  const create = useGroupingStaffAnonymizedProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    const { repeat_password, ...payload } = data
    setInProgressStatus(true)
    create(payload)
      .then(() => {
        successToast(sentence('Responsable de agrupamiento anonimizado agregado correctamente'))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GroupingStaffProfileFormFields control={control} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default GroupingStaffAnonymizedProfileCreateForm

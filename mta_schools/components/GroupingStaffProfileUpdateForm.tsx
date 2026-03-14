'use client'

import GroupingStaffProfileFormFields from '@/mta_schools/components/GroupingStaffProfileFormFields'
import { GROUPING_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import { useGroupingStaffProfileUpdate, useNavigateToGroupingStaffProfileList } from '@/mta_schools/hooks'
import { I_GroupingStaffProfileDetail, I_GroupingStaffProfileUpdateRequestData } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_GroupingStaffProfileUpdateRequestData {}
interface I_Props {
  data: I_GroupingStaffProfileDetail
}

const GroupingStaffProfileUpdateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      grouping_id: data.grouping_id,
      username: data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToGroupingStaffProfileList()
  const update = useGroupingStaffProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (payload) => {
    setInProgressStatus(true)
    update(data.id, payload)
      .then(() => {
        successToast(sentence(`${GROUPING_STAFF_PROFILE_NAME.singular} editado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GroupingStaffProfileFormFields control={control} excludePassword />
      <Spacer />
      <Submit>Guardar</Submit>
    </form>
  )
}

export default GroupingStaffProfileUpdateForm

'use client'

import SchoolStaffProfileFormFields from '@/mta_schools/components/SchoolStaffProfileFormFields'
import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolStaffProfileList, useSchoolStaffProfileUpdate } from '@/mta_schools/hooks'
import { I_SchoolStaffProfileDetail, I_SchoolStaffProfileUpdateRequestData, T_SchoolId } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  school_id: T_SchoolId
  username: string
  first_name: string
  last_name: string
  email: string
}

interface I_Props {
  data: I_SchoolStaffProfileDetail
}
const SchoolStaffProfileUpdateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      school_id: data.school_id,
      username: data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToSchoolStaffProfileList()
  const update = useSchoolStaffProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = ({ school_id, first_name, last_name, email, username }) => {
    const payload: I_SchoolStaffProfileUpdateRequestData = {
      school_id,
      username,
      first_name,
      last_name,
      email,
    }
    setInProgressStatus(true)
    update(data.id, payload)
      .then((res) => {
        log.info('School staff edited:', res)

        successToast(sentence(`${SCHOOL_STAFF_PROFILE_NAME.singular} editado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SchoolStaffProfileFormFields control={control} excludePassword />

      <Spacer />
      <Submit>Guardar</Submit>
    </form>
  )
}

export default SchoolStaffProfileUpdateForm

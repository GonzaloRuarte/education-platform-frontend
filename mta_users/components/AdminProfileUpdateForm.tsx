'use client'

import AdminProfileFormFields from '@/mta_users/components/AdminProfileFormFields'
import { ADMIN_PROFILE_NAME } from '@/mta_users/constants'
import { useAdminProfileUpdate, useNavigateToAdminProfileList } from '@/mta_users/hooks'
import { I_AdminProfileUpdateRequestData, I_UserDetail } from '@/mta_users/types'

import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  username: string
  first_name: string
  last_name: string
  email: string
}

interface I_Props {
  data: I_UserDetail
}
const AdminProfileUpdateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      username: data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToAdminProfileList()
  const update = useAdminProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = ({ first_name, last_name, email, username }) => {
    const payload: I_AdminProfileUpdateRequestData = {
      username,
      first_name,
      last_name,
      email,
    }
    setInProgressStatus(true)
    update(data.id, payload)
      .then((res) => {
        log.info(sentence(`${ADMIN_PROFILE_NAME.singular} editado correctamente`), res)

        successToast(sentence(`${ADMIN_PROFILE_NAME.singular} editado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AdminProfileFormFields control={control} excludePassword />

      <Spacer />
      <Submit>Guardar</Submit>
    </form>
  )
}

export default AdminProfileUpdateForm

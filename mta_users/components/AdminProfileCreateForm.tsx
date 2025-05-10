'use client'

import { useEvaluatorProfileCreate, useNavigateToEvaluatorProfileList } from '@/mta_evaluations/hooks/evaluators'
import AdminProfileFormFields from '@/mta_users/components/AdminProfileFormFields'
import { ADMIN_PROFILE_NAME } from '@/mta_users/constants'
import { useAdminProfileCreate, useNavigateToAdminProfileList } from '@/mta_users/hooks'
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
  password: string
  repeat_password: string
  first_name: string
  last_name: string
  email: string
}

const AdminProfileCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      username: '',
      password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToAdminProfileList()
  const create = useAdminProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then((res) => {
        log.info(`New ${ADMIN_PROFILE_NAME.singular} added:`, res)

        successToast(sentence(`${ADMIN_PROFILE_NAME.singular} agregado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AdminProfileFormFields control={control} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default AdminProfileCreateForm

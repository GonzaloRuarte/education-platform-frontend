'use client'

import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import SchoolStaffProfileFormFields from '@/mta_schools/components/SchoolStaffProfileFormFields'
import { useNavigateToSchoolStaffProfileList, useSchoolStaffProfileCreate } from '@/mta_schools/hooks'
import { T_SchoolId } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

interface I_FormFields {
  school_id: T_SchoolId
  username: string
  password: string
  repeat_password: string
  first_name: string
  last_name: string
  email: string
}

const SchoolStaffProfileCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      school_id: undefined,
      username: '',
      password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToSchoolStaffProfileList()
  const create = useSchoolStaffProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then((res) => {
        log.info('New school staff added:', res)

        successToast(sentence('Personal escolar agregado correctamente'))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SchoolStaffProfileFormFields control={control} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default SchoolStaffProfileCreateForm

'use client'

import ExecutiveProfileFormFields from '@/mta_schools/components/ExecutiveProfileFormFields'
import { useNavigateToExecutiveProfileList, useExecutiveProfileCreate } from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import { T_SchoolId } from '@/mta_schools/types'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Spinner from '@/shared/components/Spinner'
import { useInProgress } from '@/shared/hooks'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  school_id: T_SchoolId
  username: string
  password: string
  repeat_password: string
  first_name: string
  last_name: string
  email: string
}

const ExecutiveProfileCreateForm = () => {
  const { selectedSchool, isLoading } = useSchoolScopeResources()
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      school_id: selectedSchool !== undefined && selectedSchool !== null ? selectedSchool.id : undefined,
      username: '',
      password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToExecutiveProfileList()
  const create = useExecutiveProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then(() => {
        successToast(sentence('Responsable ejecutivo agregado correctamente'))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  if (isLoading) return <Spinner />

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ExecutiveProfileFormFields control={control} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default ExecutiveProfileCreateForm

'use client'

import EvaluatorProfileFormFields from '@/mta_evaluations/components/EvaluatorProfileFormFields'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import { useEvaluatorProfileCreate, useNavigateToEvaluatorProfileList } from '@/mta_evaluations/hooks/evaluators'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { useInProgress } from '@/shared/hooks'

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

const EvaluatorProfileCreateForm = () => {
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
  const navToList = useNavigateToEvaluatorProfileList()
  const create = useEvaluatorProfileCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then((res) => {

        successToast(sentence(`${EVALUATOR_PROFILE_NAME.singular} agregado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EvaluatorProfileFormFields control={control} />
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default EvaluatorProfileCreateForm

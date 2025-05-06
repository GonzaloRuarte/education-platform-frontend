'use client'

import EvaluatorProfileFormFields from '@/mta_evaluations/components/EvaluatorProfileFormFields'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import { useEvaluatorProfileUpdate, useNavigateToEvaluatorProfileList } from '@/mta_evaluations/hooks/evaluators'
import { I_EvaluatorProfileDetail, I_EvaluatorProfileUpdateRequestData } from '@/mta_evaluations/types/evaluatorProfile'

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
  data: I_EvaluatorProfileDetail
}
const EvaluatorProfileUpdateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      username: data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToEvaluatorProfileList()
  const update = useEvaluatorProfileUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = ({ first_name, last_name, email, username }) => {
    const payload: I_EvaluatorProfileUpdateRequestData = {
      username,
      first_name,
      last_name,
      email,
    }
    setInProgressStatus(true)
    update(data.id, payload)
      .then((res) => {
        log.info(sentence(`${EVALUATOR_PROFILE_NAME.singular} editado correctamente`), res)

        successToast(sentence(`${EVALUATOR_PROFILE_NAME.singular} editado correctamente`))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EvaluatorProfileFormFields control={control} excludePassword />

      <Spacer />
      <Submit>Guardar</Submit>
    </form>
  )
}

export default EvaluatorProfileUpdateForm

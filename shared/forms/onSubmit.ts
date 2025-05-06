import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { FieldValues, SubmitHandler } from 'react-hook-form'

interface I_GenerateOnSubmitParams<T_FormFields> {
  apiCall: (data: T_FormFields) => Promise<any>
  onSuccessMessage: string
  onSuccessRedirect: () => void
  setInProgressStatus: (status: boolean) => void
}

export function onSubmit<T_FormFields extends FieldValues>({
  apiCall,
  onSuccessMessage,
  onSuccessRedirect,
  setInProgressStatus,
}: I_GenerateOnSubmitParams<T_FormFields>): SubmitHandler<T_FormFields> {
  return (data) => {
    setInProgressStatus(true)
    apiCall(data)
      .then((res) => {
        log.info('Operation successful:', res)
        successToast(sentence(onSuccessMessage))
        onSuccessRedirect()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }
}

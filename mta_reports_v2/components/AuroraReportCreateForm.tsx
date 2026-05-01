'use client'

import {
  useAuroraReportCreate,
  useNavigateToAuroraReportList,
} from '@/mta_reports_v2/hooks'
import { I_AuroraReportCreateRequestData } from '@/mta_reports_v2/types'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  school: number
}

const defaultValues: I_FormFields = {
  school: 0,
}

const AuroraReportCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })
  const { setInProgressStatus } = useInProgress()
  const navigateToAuroraReportList = useNavigateToAuroraReportList()
  const auroraReportCreate = useAuroraReportCreate()

  const onSubmit: SubmitHandler<I_FormFields> = ({ school }) => {
    const data: I_AuroraReportCreateRequestData = { school, toma: '1-2026' }
    setInProgressStatus(true)
    auroraReportCreate(data)
      .then(() => {
        successToast('Reporte Aurora agregado correctamente')
        navigateToAuroraReportList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <SchoolSelectControlled<I_FormFields>
          control={control}
          name="school"
          rules={{ ...rules.required() }}
          label="Escuela"
        />
      </MagicGrid>
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default AuroraReportCreateForm

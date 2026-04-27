'use client'

import { useNavigateToReportList, useReportCreate } from '@/mta_reports/hooks'
import { reportLabels } from '@/mta_reports/labels'
import { I_ReportDetail, I_ReportCreateRequestData } from '@/mta_reports/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'

import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_ReportCreateRequestData, 'school' | 'power_bi_link'> {
  school: I_ReportDetail['school'] | null
  power_bi_link: I_ReportDetail['power_bi_link'] | string 
}

const ReportCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      school: null,
      title: '',
      power_bi_link: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const backToDetail = useNavigateToReportList()
  const createReport = useReportCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    const payload = {
      school: data.school as number,
      title: data.title,
      power_bi_link: data.power_bi_link

    }

    createReport(payload)
      .then(() => {
        successToast('Reporte agregado correctamente')
        backToDetail()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <SchoolSelectControlled control={control} name="school" rules={{ ...rules.required() }} />
        <InputControlled<I_FormFields>
          control={control}
          name="title"
          label={reportLabels.title}
          rules={{ ...rules.required() }}
        />
        <InputControlled<I_FormFields>
          control={control}
          name="power_bi_link"
          label={reportLabels.powerBILink}
          rules={{
            ...rules.required(),
            validate: (value: string) => {
              try {
                new URL(value) // throws if invalid
                return true
              } catch {
                return 'Por favor ingrese un enlace válido.'
              }
            },
          }}
        />

      </MagicGrid>
      <Spacer />

      <Submit>{sharedLabels.add}</Submit>
    </form>
  )
}

export default ReportCreateForm

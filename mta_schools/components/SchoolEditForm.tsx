'use client'

import { useNavigateToSchoolList, useSchoolUpdate } from '@/mta_schools/hooks'
import { I_SchoolDetail, I_SchoolUpdateRequestData } from '@/mta_schools/types'
import InputControlled from '@/shared/forms/InputControlled'
import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import Chip from '@/shared/components/Chip'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Link from 'next/link'
import pages from '@/pages'

interface I_FormFields extends I_SchoolUpdateRequestData {}

interface I_Props {
  data: I_SchoolDetail
}
const SchoolCreateForm = ({ data }: I_Props) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      ...data,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToSchoolList()
  const schoolUpdate = useSchoolUpdate()

  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    schoolUpdate(data.id, updatedData)
      .then(() => {
        successToast('Escuela editada correctamente')
        navigateToSchoolList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <InputControlled<I_FormFields> control={control} name="name" rules={{ ...rules.required() }} label="Nombre" />
        <InputControlled<I_FormFields> control={control} type="email" name="contact_email" label="E-Mail" />
        <InputControlled<I_FormFields>
          control={control}
          type="text"
          name="district"
          rules={{ ...rules.required() }}
          label="Distrito"
        />
        <InputControlled<I_FormFields>
          control={control}
          type="number"
          name="max_executives"
          rules={{ ...rules.required() }}
          label="Máximo de Responsables Ejecutivos"
        />
          <InputControlled<I_FormFields>
          control={control}
          type="number"
          name="meta_id"
          rules={{ ...rules.required() }}
          label="Meta ID"
        />
      </MagicGrid>
      <Spacer />
      <H4>Staff</H4>
      <Spacer size="s" />
      <MagicGrid itemSize="auto">
        {data.staff.map((member) => {
          return (
            <Link
              key={member.school_staff_id}
              href={`${pages.D._.usuarios._.responsableInstitucional.path}/${member.school_staff_id}`}
            >
              <Chip icon={<AccountCircleIcon />} label={`${member.full_name} <${member.email}>`} />
            </Link>
          )
        })}
      </MagicGrid>
      <Spacer />

      <Submit>Guardar</Submit>
    </form>
  )
}

export default SchoolCreateForm

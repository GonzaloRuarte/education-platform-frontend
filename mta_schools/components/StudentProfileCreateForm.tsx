'use client'

import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileCreate } from '@/mta_schools/hooks'
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
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  cohort: string
  personal_id: string
  school_id: T_SchoolId
}

const StudentProfileCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      cohort: '',
      personal_id: '',
      school_id: undefined,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navigateToSchoolList = useNavigateToStudentProfileList()
  const studentProfileCreate = useStudentProfileCreate()
  const onSubmit: SubmitHandler<I_FormFields> = ({ personal_id, ...rest }) => {
    setInProgressStatus(true)
    studentProfileCreate({ personal_id: Number(personal_id), ...rest })
      .then((res) => {
        log.info('New student added:', res)

        successToast(`${STUDENT_PROFILE_NAME.singular} agregado correctamente`)
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
        <InputControlled<I_FormFields>
          control={control}
          name="personal_id"
          rules={{ ...rules.required(), ...rules.minLength(8) }}
          label="DNI"
          type="number"
        />
        <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} label="Escuela" />
        <InputControlled<I_FormFields>
          control={control}
          name="cohort"
          rules={{
            ...rules.required(),
            ...rules.pattern(/^[A-Z0-9_]+$/, 'Solo se permiten letras mayúsculas, números y guiones bajos'),
          }}
          label="División"
          helperText='Escribir la división en mayúsculas y sin espacios, usando guiones bajos. Ej. para 7º "B", Turno Mañana, usar: 7_B_TM'
        />
      </MagicGrid>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default StudentProfileCreateForm

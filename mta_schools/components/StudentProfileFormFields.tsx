'use client'

import { useHasCapabilities } from '@/mta_auth/hooks'
import { CohortSelectControlled } from '@/mta_schools/components/CohortSelect'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { T_SchoolNames, T_SchoolId } from '@/mta_schools/types'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import MagicGrid from '@/shared/components/MagicGrid'
import { useWatch, Control } from 'react-hook-form'

export interface I_FormFields {
  cohort: string
  personal_id: number | '' | null
  school_id: T_SchoolId
}

interface I_Props {
  control: Control<I_FormFields>
  schoolOptions?: T_SchoolNames
  lockSchool?: boolean
}

const StudentProfileFormFields = ({ control, schoolOptions, lockSchool = false }: I_Props) => {
  const schoolId = useWatch({ control, name: 'school_id' })
  const canViewStudentDni = useHasCapabilities(['view_student_dni'])

  return (
    <MagicGrid>
      {!lockSchool && (
        <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} label="Escuela" options={schoolOptions} />
      )}
      {canViewStudentDni && (
        <InputControlled<I_FormFields>
          control={control}
          name="personal_id"
          rules={{
            ...rules.required(),
            ...rules.minLength(8),
            ...rules.pattern(/^\d{8,10}$/, 'Ingrese un DNI válido de 8 a 10 dígitos'),
          }}
          label="DNI"
          type="text"
          inputProps={{ inputMode: 'numeric', pattern: '\d*', maxLength: 10 }}
        />
      )}
      {schoolId !== undefined && (
        <CohortSelectControlled
          control={control}
          name="cohort"
          schoolId={schoolId}
          helperText='Seleccione una de las divisiones existentes o escriba una nueva. Escribir la división en mayúsculas y sin espacios, usando guiones bajos. Ej. para 7º "B" del Turno Mañana, usar: 7_B_TM. Si no hay turnos mañana/tarde, puede poner 7_B sin el TM.'
          rules={{
            ...rules.required(),
            ...rules.pattern(/^[A-Z0-9_]+$/, 'Solo se permiten letras mayúsculas, números y guiones bajos'),
          }}
        />
      )}
    </MagicGrid>
  )
}
export default StudentProfileFormFields

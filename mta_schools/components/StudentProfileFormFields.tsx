'use client'

import { CohortSelectControlled } from '@/mta_schools/components/CohortSelect'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import MagicGrid from '@/shared/components/MagicGrid'
import { useWatch, Control } from 'react-hook-form'
import { T_SchoolId } from '@/mta_schools/types'

export interface I_FormFields {
  cohort: string
  personal_id: number | ''
  school_id: T_SchoolId
}

interface I_Props {
  control: Control<I_FormFields>
  ownSchoolData: boolean
}

const StudentProfileFormFields = ({ control, ownSchoolData }: I_Props) => {
  const schoolId = useWatch({ control, name: 'school_id' })

  return (
    <MagicGrid>
      {!ownSchoolData && (
        <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} label="Escuela" />
      )}
      <InputControlled<I_FormFields>
        control={control}
        name="personal_id"
        rules={{ ...rules.required(), ...rules.minLength(8) }}
        label="DNI"
        type="number"
      />
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

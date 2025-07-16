'use client'

import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { T_SchoolId } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useWatch } from 'react-hook-form'
import PasswordField from '@/shared/components/PasswordField'

interface I_FormFields {
  school_id: T_SchoolId
  username: string
  password: string
  repeat_password: string
  first_name: string
  last_name: string
  email: string
}

const ExecutiveProfileFormFields = ({ control, excludePassword = false }) => {
  const password = useWatch({ control, name: 'password' })

  return (
    <MagicGrid>
      <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} label="Escuela" />
      <Spacer size="xs" />
      <InputControlled<I_FormFields>
        control={control}
        name="username"
        rules={{
          ...rules.required(),
          ...rules.minLength(4),
          ...rules.pattern(
            /^[a-z0-9_.-]+$/,
            'Solo se permiten letras minúsculas, números, puntos, guiones y guiones bajos',
          ),
        }}
        label="Nombre de usuario"
      />
      {!excludePassword && (
        <PasswordField<I_FormFields>
          control={control}
          name="password"
          rules={{
            ...rules.required(),
            ...rules.minLength(6),
            ...rules.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
              'Debe contener al menos una letra y un número',
            ),
          }}
          label="Contraseña"
        />
      )}
      {!excludePassword && (
        <>
          <PasswordField<I_FormFields>
            control={control}
            name="repeat_password"
            rules={{
              ...rules.required(),
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            }}
            label="Repetir contraseña"
          />
          <Spacer size="xs" />
        </>
      )}

      <InputControlled<I_FormFields>
        control={control}
        name="first_name"
        rules={{ ...rules.required() }}
        label="Nombre"
      />
      <InputControlled<I_FormFields>
        control={control}
        name="last_name"
        rules={{ ...rules.required() }}
        label="Apellido"
      />
      <InputControlled<I_FormFields>
        control={control}
        name="email"
        rules={{ ...rules.required(), ...rules.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Debe ser un correo válido') }}
        label="Correo electrónico"
        type="email"
      />
    </MagicGrid>
  )
}

export default ExecutiveProfileFormFields

'use client'

import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { useNavigateToSchoolStaffProfileList, useSchoolStaffProfileCreate } from '@/mta_schools/hooks'
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
import { sentence } from '@/shared/utils'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

interface I_FormFields {
  school_id: T_SchoolId
  username: string
  password: string
  repeat_password: string
  first_name: string
  last_name: string
  email: string
}

const SchoolStaffProfileCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      school_id: undefined,
      username: '',
      password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { setInProgressStatus } = useInProgress()
  const navToList = useNavigateToSchoolStaffProfileList()
  const create = useSchoolStaffProfileCreate()
  const password = useWatch({ control, name: 'password' })

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create(data)
      .then((res) => {
        log.info('New school staff added:', res)

        successToast(sentence('Personal escolar agregado correctamente'))
        navToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} label="Escuela" />
        <Spacer size="xs" />
        <InputControlled<I_FormFields>
          control={control}
          name="username"
          rules={{
            ...rules.required(),
            ...rules.minLength(4),
            ...rules.pattern(/^[a-z0-9_.]+$/, 'Solo se permiten letras minúsculas, números, puntos y guiones bajos'),
          }}
          label="Nombre de usuario"
        />
        <InputControlled<I_FormFields>
          control={control}
          name="password"
          rules={{
            ...rules.required(),
            ...rules.minLength(8),
            ...rules.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
              'Debe contener al menos una letra y un número',
            ),
          }}
          label="Contraseña"
          type="password"
        />
        <InputControlled<I_FormFields>
          control={control}
          name="repeat_password"
          rules={{
            ...rules.required(),
            validate: (value) => value === password || 'Las contraseñas no coinciden',
          }}
          label="Repetir contraseña"
          type="password"
        />
        <Spacer size="xs" />
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
      <Spacer />
      <Submit>Agregar</Submit>
    </form>
  )
}

export default SchoolStaffProfileCreateForm

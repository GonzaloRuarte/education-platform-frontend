import { appointmentLabels } from '@/mta_schedule/labels'
import { I_AppointmentCreateRequestData } from '@/mta_schedule/types'
import hoursOptions from '@/mta_schedule/utils'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
import DateCalendarController from '@/shared/forms/DateCalendarControlled'
import IntegerInputControlled from '@/shared/forms/IntegerInputControlled'
import { rules } from '@/shared/forms/messages'
import SelectControlled from '@/shared/forms/SelectControlled'
import { Grid2 } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_AppointmentCreateRequestData, 'date'> {
  date: Dayjs
}

const options = hoursOptions({ startHour: 9, endHour: 17, stepMinutes: 30 })

const AppointmentCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      begins_at: options[0].value,
      date: dayjs(),
      quantity: 1,
    },
  })

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    console.log(data.date.format('YYYY-MM-DD'))
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={3}>
          <Grid2 size={4}>
            <DateCalendarController control={control} name="date" rules={{ ...rules.required() }} />
          </Grid2>
          <Grid2 size={4}>
            <SelectControlled
              control={control}
              name="begins_at"
              options={options}
              label={appointmentLabels.begins_at}
            />
            <Spacer />
            <Body1>
              Los turnos tienen un rango de 2 horas cada uno. Al seleccionar el horario de inicio del turno el mismo se
              confirmará con el horario de finalización.{' '}
            </Body1>
            <Spacer size="m" />
            <H4>{appointmentLabels.quantity}</H4>
            <IntegerInputControlled min={1} control={control} name="quantity" />
          </Grid2>
        </Grid2>
        <Spacer />

        <Submit>Agregar</Submit>
      </form>
    </>
  )
}

export default AppointmentCreateForm

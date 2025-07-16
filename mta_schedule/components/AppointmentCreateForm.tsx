import { useAppointmentCreate, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import { appointmentLabels } from '@/mta_schedule/labels'
import { combinedDateAndTime, hoursOptions } from '@/mta_schedule/utils'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
import DateCalendarControlled from '@/shared/forms/DateCalendarControlled'
import CountInputControlled from '@/shared/forms/CountInputControlled'
import { rules } from '@/shared/forms/messages'
import SelectControlled from '@/shared/forms/SelectControlled'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { Grid2 } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  date: Dayjs
  beginning_hour: string
  quantity: number
}

const options = hoursOptions()

const AppointmentCreateForm = () => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      beginning_hour: options[0].value,
      date: dayjs(),
      quantity: 1,
    },
  })
  const create = useAppointmentCreate()
  const backToList = useNavigateToAppointmentList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress()
    const payload = {
      begins_at: combinedDateAndTime({ date: data.date, time: data.beginning_hour }),
      quantity: data.quantity,
    }

    create(payload)
      .then((res) => {
        backToList()
      })
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={3}>
          {/* Calendar ───────────────────────── */}
          <Grid2
            size={{ xs: 12, md: 8, lg: 5 }}   // 👈 one prop instead of xs/md/lg
            sx={{ minWidth: 280 }}
          >
            <DateCalendarControlled
              control={control}
              name="date"
              rules={{ ...rules.required() }}
            />
          </Grid2>

          {/* Right-hand column ──────────────── */}
          <Grid2 size={{ xs: 12, md: 4, lg: 7}}>
            <SelectControlled
              control={control}
              name="beginning_hour"
              options={options}
              label={appointmentLabels.begins_at}
            />

            <Spacer />

            <Body1>
              Los turnos de la mañana comienzan a las 8 am y terminan a la 1 pm (rango
              escolar de la mañana), mientras que los turnos de la tarde comienzan a
              la 1 pm y terminan a las 6 pm (rango escolar de la tarde).
            </Body1>

            <Spacer size="m" />

            <H4>{appointmentLabels.quantity}</H4>
            <CountInputControlled min={1} max={5} control={control} name="quantity" />
          </Grid2>
        </Grid2>

        <Spacer />

        <Submit>Agregar</Submit>
      </form>
    </>
  )
}

export default AppointmentCreateForm

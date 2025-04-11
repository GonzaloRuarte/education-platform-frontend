'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { T_EvaluationSubjectId } from '@/mta_evaluations/types'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentFreeListByMonth, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import { T_AppointmentId, T_AppointmentsAvailableList } from '@/mta_schedule/types'
import { availableDays, hoursOptions } from '@/mta_schedule/utils'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import { SelectSchoolControlled } from '@/mta_schools/components/SelectSchool'
import { SchoolGrade } from '@/mta_schools/constants'
import { T_SchoolId } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import DateCalendarControlled from '@/shared/forms/DateCalendarControlled'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import OptionToggleControlled from '@/shared/forms/OptionToggleControlled'
import { useInProgress } from '@/shared/hooks'
import { FormLabel, Grid2 } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  appointment_id: T_AppointmentId
  school_id: T_SchoolId
  pin: number
  evaluation_subject_id: T_EvaluationSubjectId | null
  grade: SchoolGrade
  date: Dayjs
}

const options = hoursOptions({ startHour: 9, endHour: 17, stepMinutes: 30 })

const distinctAvailableAppointments = (appointments: T_AppointmentsAvailableList) => {
  const disctint: Record<string, T_AppointmentsAvailableList> = {}
  appointments.forEach((a) => {
    if (!(a.begins_at in disctint)) {
      disctint[a.begins_at] = []
    }
    disctint[a.begins_at].push(a)
  })
  return Object.entries(disctint)
}

const AppointmentCreateForm = () => {
  const [refDate, setRefDate] = useState(dayjs())
  const [appointmentOptions, setAppointmentOption] = useState<T_AppointmentsAvailableList>([])
  const { handleSubmit, control, getValues } = useForm<I_FormFields>({
    defaultValues: {
      appointment_id: undefined,
      evaluation_subject_id: null,
      grade: undefined,
      pin: undefined,
      school_id: undefined,
    },
  })
  const backToList = useNavigateToAppointmentList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const { data: appointmentFreeListByMonth, reload } = useAppointmentFreeListByMonth({
    year: refDate.year(),
    month: refDate.month() + 1,
  })
  const updateAppointmentsList = () => {
    if (appointmentFreeListByMonth === undefined) return

    setAppointmentOption(appointmentFreeListByMonth[getValues().date.date()])
  }

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    // setIsInProgress()
    // const payload = {
    //   begins_at: combinedDateAndTime({ date: data.date, time: data.beginning_hour }),
    //   quantity: data.quantity,
    // }
    // create(payload)
    //   .then((res) => {
    //     backToList()
    //   })
    //   .catch(handleServiceError)
    //   .finally(setIsNotInProgress)
  }
  return (
    <Page>
      <Page.Title>Solicitar {APPOINTMENT_NAME.singular}</Page.Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={3}>
          <Grid2 size={4}>
            {appointmentFreeListByMonth !== undefined && (
              <DateCalendarControlled
                onMonthChange={(newDate) => setRefDate(newDate)}
                onYearChange={(newDate) => setRefDate(newDate)}
                onChangeCallback={updateAppointmentsList}
                control={control}
                name="date"
                rules={{ ...rules.required() }}
                availableDays={availableDays(appointmentFreeListByMonth)}
              />
            )}
          </Grid2>
          <Grid2 size={4}>
            <FormLabel>Turnos disponibles para la fecha seleccionada:</FormLabel>
            <Spacer />
            <OptionToggleControlled
              orientation="vertical"
              options={distinctAvailableAppointments(appointmentOptions).map(([datetime, availbleAppointments]) => ({
                value: availbleAppointments[0].id,
                label: `${dayjs(datetime).format('HH:mm')} hs (${availbleAppointments.length} turnos disponibles)`,
              }))}
              name="appointment_id"
              control={control}
            />
            <Spacer />
          </Grid2>
          <Grid2 size={8}>
            <MagicGrid>
              <SelectSchoolControlled control={control} name="school_id" />
              <InputControlled control={control} name="pin" type="number" label="Pin" />
              <SubjectOptions control={control} name="evaluation_subject_id" />
              <SchoolGradeSelectControlled control={control} name="grade" />
            </MagicGrid>
          </Grid2>
        </Grid2>
        <Spacer />

        <Submit>Agregar</Submit>
      </form>
    </Page>
  )
}

export default AppointmentCreateForm

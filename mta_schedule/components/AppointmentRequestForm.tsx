'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { T_EvaluationSubjectId } from '@/mta_evaluations/types'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import {
  useAppointmentFreeListByMonth,
  useAppointmentRequest,
  useNavigateToAppointmentList,
} from '@/mta_schedule/hooks'
import { I_AppointmentAvailable, T_AppointmentId } from '@/mta_schedule/types'
import { availableDays, distinctAvailableAppointments, slotLabelFromBeginning } from '@/mta_schedule/utils'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { SchoolGrade } from '@/mta_schools/constants'
import { I_SchoolName, T_SchoolId, T_SchoolNames } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { H4 } from '@/shared/components/Typography'
import DateCalendarControlled from '@/shared/forms/DateCalendarControlled'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import OptionToggleControlled from '@/shared/forms/OptionToggleControlled'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { randomInt } from '@/shared/utils'
import { FormLabel, Grid2 } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  appointment_id: T_AppointmentId
  school_id: T_SchoolId
  pin: number
  evaluation_subject_id: T_EvaluationSubjectId | null
  grade: SchoolGrade
  date: Dayjs
  comments: string
}

interface I_Props {
  selectedSchool: I_SchoolName | null
  availableSchools: T_SchoolNames
  lockSchool: boolean
}
const AppointmentRequestForm = ({ selectedSchool, availableSchools, lockSchool }: I_Props) => {
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const backToList = useNavigateToAppointmentList()
  const [refDate, setRefDate] = useState(dayjs())
  const [selectedAppointmentData, setSelectedAppointmentData] = useState<I_AppointmentAvailable | null>(null)
  const [appointmentOptions, setAppointmentOptions] = useState<Array<{ value: T_AppointmentId; label: string }>>([])
  const requestAppointment = useAppointmentRequest()

  const { data: appointmentFreeListByMonth } = useAppointmentFreeListByMonth({
    year: refDate.year(),
    month: refDate.month() + 1,
  })
  const { handleSubmit, control, getValues, watch } = useForm<I_FormFields>({
    defaultValues: {
      appointment_id: undefined,
      evaluation_subject_id: null,
      grade: undefined,
      pin: randomInt(1000, 9999),
      school_id: selectedSchool === null ? undefined : selectedSchool.id,
      comments: '',
    },
  })
  const onSubmit: SubmitHandler<I_FormFields> = ({ date, ...data }) => {
    setIsInProgress()
    requestAppointment({ ...data }).then(backToList).catch(handleServiceError).finally(setIsNotInProgress)
  }

  const appointment_id = watch('appointment_id')

  const handleDateChange = () => {
    if (appointmentFreeListByMonth === undefined) return

    const selectedDate = getValues('date')
    if (selectedDate === undefined || selectedDate === null) {
      setAppointmentOptions([])
      setSelectedAppointmentData(null)
      return
    }

    const choosenDate = selectedDate.date()  // Already in local time from form
    const availableOptions = appointmentFreeListByMonth[choosenDate] ?? []

    setAppointmentOptions(
      Object.entries(distinctAvailableAppointments(availableOptions)).map(([datetime, availbleAppointments]) => ({
        value: availbleAppointments[0].id,
        label: `${slotLabelFromBeginning(datetime)} (${availbleAppointments.length} turnos disponibles)`,
      })),
    )
  }

  useEffect(() => {
    if (appointmentFreeListByMonth === undefined) return

    const selectedDate = getValues('date')
    if (selectedDate === undefined || selectedDate === null) {
      setSelectedAppointmentData(null)
      return
    }

    const choosenDate = selectedDate.date()  // Already in local time from form
    const availableAppointments = appointmentFreeListByMonth[choosenDate] ?? []

    setSelectedAppointmentData(availableAppointments.find((appointment) => appointment.id === appointment_id) || null)
  }, [appointment_id, appointmentFreeListByMonth, getValues])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 8, lg: 5 }} sx={{ minWidth: 280 }}>
          {appointmentFreeListByMonth !== undefined && (
            <DateCalendarControlled
              onMonthChange={(newDate) => setRefDate(newDate)}
              onYearChange={(newDate) => setRefDate(newDate)}
              onChangeCallback={handleDateChange}
              control={control}
              name="date"
              rules={{ ...rules.required() }}
              availableDays={availableDays(appointmentFreeListByMonth)}
            />
          )}
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4, lg: 7 }}>
          {selectedAppointmentData !== null && (
            <>
              <AppointmentBriefCard
                title="Turno Seleccionado"
                appointmentId={selectedAppointmentData.id}
                begins_at={selectedAppointmentData.begins_at}
              />
              <Spacer />
            </>
          )}
          <FormLabel>Turnos disponibles para la fecha seleccionada:</FormLabel>
          <Spacer />
          <OptionToggleControlled
            orientation="vertical"
            rules={{ ...rules.required() }}
            options={[...appointmentOptions]}
            name="appointment_id"
            control={control}
          />
        </Grid2>

        <Grid2 size={12}>
          <MagicGrid>
            {!lockSchool ? (
              <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} options={availableSchools} />
            ) : (
              <H4>{selectedSchool?.name}</H4>
            )}

            <InputControlled control={control} name="pin" type="number" label="Pin" rules={{ ...rules.required() }} />
            <SubjectOptions control={control} name="evaluation_subject_id" />
            <SchoolGradeSelectControlled control={control} name="grade" rules={{ ...rules.required() }} />
            <InputControlled
              control={control}
              name="comments"
              label="Especifique la división aquí"
              multiline
              rows={3}
            />
          </MagicGrid>
        </Grid2>
      </Grid2>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default AppointmentRequestForm

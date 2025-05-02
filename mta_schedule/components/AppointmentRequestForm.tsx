'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { T_EvaluationSubjectId } from '@/mta_evaluations/types'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentFreeListByMonth,
  useAppointmentRequest,
  useNavigateToAppointmentList,
} from '@/mta_schedule/hooks'
import { I_AppointmentAvailable, T_AppointmentId, T_AppointmentsAvailableList } from '@/mta_schedule/types'
import { availableDays } from '@/mta_schedule/utils'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { SchoolGrade } from '@/mta_schools/constants'
import { useSchoolStaffProfileOwnSchool } from '@/mta_schools/hooks'
import { I_SchoolName, T_SchoolId } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
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
}
const distinctAvailableAppointments = (appointments: T_AppointmentsAvailableList) => {
  const disctint: Record<string, T_AppointmentsAvailableList> = {}
  appointments.forEach((a) => {
    if (!(a.begins_at in disctint)) {
      disctint[a.begins_at] = []
    }
    disctint[a.begins_at].push(a)
  })

  return disctint
}

interface I_Props {
  ownSchoolData: I_SchoolName | null
}
const AppointmentRequestForm = ({ ownSchoolData }: I_Props) => {
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
      school_id: ownSchoolData === null ? undefined : ownSchoolData.id,
    },
  })
  const onSubmit: SubmitHandler<I_FormFields> = ({ date, ...data }) => {
    const payload = { ...data }
    setIsInProgress()
    requestAppointment(payload).then(backToList).catch(handleServiceError).finally(setIsNotInProgress)
  }

  const appointment_id = watch('appointment_id')

  const handleDateChange = () => {
    if (appointmentFreeListByMonth === undefined) return

    const choosenDate = getValues().date.date()
    const availableOptions = appointmentFreeListByMonth[choosenDate]

    setAppointmentOptions(
      Object.entries(distinctAvailableAppointments(availableOptions)).map(([datetime, availbleAppointments]) => ({
        value: availbleAppointments[0].id,
        label: `${dayjs(datetime).format('HH:mm')} hs (${availbleAppointments.length} turnos disponibles)`,
      })),
    )
  }

  useEffect(() => {
    if (appointmentFreeListByMonth === undefined) return
    const choosenDate = getValues('date').date()
    setSelectedAppointmentData(
      appointmentFreeListByMonth[choosenDate].find((appointment) => appointment.id === appointment_id) || null,
    )
  }, [appointment_id])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid2 container spacing={3}>
        <Grid2 size={4}>
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
        <Grid2 size={8}>
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
            {ownSchoolData === null ? (
              <SchoolSelectControlled control={control} name="school_id" rules={{ ...rules.required() }} />
            ) : (
              <>
                <H4>{ownSchoolData.name}</H4>
              </>
            )}

            <InputControlled control={control} name="pin" type="number" label="Pin" rules={{ ...rules.required() }} />
            <SubjectOptions control={control} name="evaluation_subject_id" />
            <SchoolGradeSelectControlled control={control} name="grade" rules={{ ...rules.required() }} />
          </MagicGrid>
        </Grid2>
      </Grid2>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default AppointmentRequestForm

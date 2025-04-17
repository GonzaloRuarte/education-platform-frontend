'use client'

import SubjectOptions from '@/mta_evaluations/components/SubjectOptions'
import { T_EvaluationSubjectId } from '@/mta_evaluations/types'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentFreeListByMonth,
  useAppointmentRequest,
  useNavigateToAppointmentList,
} from '@/mta_schedule/hooks'
import { I_AppointmentAvailable, T_AppointmentId, T_AppointmentsAvailableList } from '@/mta_schedule/types'
import { availableDays } from '@/mta_schedule/utils'
import { SchoolGradeSelectControlled } from '@/mta_schools/components/SchoolGradeSelect'
import { SelectSchoolControlled } from '@/mta_schools/components/SelectSchool'
import { SchoolGrade } from '@/mta_schools/constants'
import { T_SchoolId } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H3, H4 } from '@/shared/components/Typography'
import DateCalendarControlled from '@/shared/forms/DateCalendarControlled'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import OptionToggleControlled from '@/shared/forms/OptionToggleControlled'
import { useInProgress } from '@/shared/hooks'
import { randomInt, sentence } from '@/shared/utils'
import { Box, FormLabel, Grid2 } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Chip from '@/shared/components/Chip'
import { LIGHT_BG_COLOR } from '@/config'
import { handleServiceError } from '@/shared/service'
import TodayIcon from '@mui/icons-material/Today'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'

require('dayjs/locale/es')

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

const AppointmentRequestPage = () => {
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
      school_id: undefined,
    },
  })
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

  const onSubmit: SubmitHandler<I_FormFields> = ({ date, ...data }) => {
    const payload = { ...data }
    setIsInProgress()
    requestAppointment(payload).then(backToList).catch(handleServiceError).finally(setIsNotInProgress)
  }

  useEffect(() => {
    if (appointmentFreeListByMonth === undefined) return
    const choosenDate = getValues('date').date()
    setSelectedAppointmentData(
      appointmentFreeListByMonth[choosenDate].find((appointment) => appointment.id === appointment_id) || null,
    )
  }, [appointment_id])
  return (
    <Page>
      <Page.Title>Solicitar {APPOINTMENT_NAME.singular}</Page.Title>
      <Page.Content>
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
                <SelectSchoolControlled control={control} name="school_id" rules={{ ...rules.required() }} />
                <InputControlled
                  control={control}
                  name="pin"
                  type="number"
                  label="Pin"
                  rules={{ ...rules.required() }}
                />
                <SubjectOptions control={control} name="evaluation_subject_id" />
                <SchoolGradeSelectControlled control={control} name="grade" rules={{ ...rules.required() }} />
              </MagicGrid>
            </Grid2>
          </Grid2>
          <Spacer />

          <Submit>Agregar</Submit>
        </form>
      </Page.Content>
    </Page>
  )
}

export default withAuth(AppointmentRequestPage, {
  allowedAccessGroups: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

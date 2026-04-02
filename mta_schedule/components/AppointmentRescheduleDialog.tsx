/* -----------------------------------------------------------
   File: src/mta_schedule/components/RescheduleDialog.tsx
------------------------------------------------------------ */
import React, { useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

/* ── MUI ─────────────────────────────────────────────────── */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from '@mui/material'

/* ── Shared UI components ───────────────────────────────── */
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import DateCalendarControlled from '@/shared/forms/DateCalendarControlled'
import OptionToggleControlled from '@/shared/forms/OptionToggleControlled'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'

/* ── Hooks & utils ──────────────────────────────────────── */
import {
  useAppointmentFreeListByMonth,
  useAppointmentReschedule,
} from '@/mta_schedule/hooks'
import { availableDays, distinctAvailableAppointments } from '@/mta_schedule/utils'
import { useForm } from 'react-hook-form'
import { rules } from '@/shared/forms/messages'
import { handleServiceError } from '@/shared/service'
import { useInProgress } from '@/shared/hooks'
/* ── Types ──────────────────────────────────────────────── */
import {
  I_AppointmentListItem,
  T_AppointmentId,
  I_AppointmentAvailable
} from '@/mta_schedule/types'

/* ───────────────────────────────────────────────────────── */

interface FormFields {
  date: Dayjs
  appointment_id: T_AppointmentId | undefined
}

interface Props {
  open: boolean
  onClose: () => void
  originalAppointment: I_AppointmentListItem | null
  onRescheduled?: () => void
}

/* -------------------------------------------------------- */
const RescheduleDialog: React.FC<Props> = ({ open, onClose, originalAppointment, onRescheduled }) => {
  /* guard – originalAppointment might be null while dialog closes */
  if (!originalAppointment) return null

  /* ── hooks ──────────────────────────────────────────── */
  const { setIsInProgress, setIsNotInProgress } = useInProgress()


  const reschedule = useAppointmentReschedule()

  const initialDate = dayjs(originalAppointment.begins_at)

  const [refDate, setRefDate] = useState(initialDate)
  const [selectedAppointmentData, setSelectedAppointmentData] = useState<I_AppointmentAvailable | null>(null)
  const [appointmentOptions, setAppointmentOptions] = useState<Array<{ value: T_AppointmentId; label: string }>>([])

  const { control, handleSubmit, getValues, reset } = useForm<FormFields>({
    defaultValues: {
      date: initialDate,
      appointment_id: undefined,
    },
  })

  useEffect(() => {
    if (!open || !originalAppointment) return

    const fixedDate = dayjs(originalAppointment.begins_at)

    setRefDate(fixedDate)
    reset({
      date: fixedDate,
      appointment_id: undefined,
    })
  }, [open, originalAppointment, reset])
  const { data: freeByMonth } = useAppointmentFreeListByMonth({
    month: refDate.month() + 1,
    year: refDate.year(),
  })
  /* whenever date or data changes, rebuild time-slot list */
  const handleDateChange = () => {
    if (freeByMonth === undefined) return

    const selectedDate = getValues('date')
    if (selectedDate === undefined || selectedDate === null) {
      setAppointmentOptions([])
      setSelectedAppointmentData(null)
      return
    }

    const choosenDate = selectedDate.date()
    const availableOptions = freeByMonth[choosenDate] ?? []

    setAppointmentOptions(
      Object.entries(distinctAvailableAppointments(availableOptions)).map(([datetime, availbleAppointments]) => ({
        value: availbleAppointments[0].id,
        label: `${dayjs(datetime).format('HH:mm')} a ${dayjs(datetime).add(300, 'minute').format('HH:mm')} hrs (${availbleAppointments.length} turnos disponibles)`,
      })),
    )
  }
  useEffect(() => {
    if (freeByMonth === undefined) return

    const selectedDate = getValues('date')
    if (selectedDate === undefined || selectedDate === null) {
      setSelectedAppointmentData(null)
      return
    }

    const choosenDate = selectedDate.date()
    const availableAppointments = freeByMonth[choosenDate] ?? []

    setSelectedAppointmentData(availableAppointments.find((appointment) => appointment.id === originalAppointment.id) || null)
  }, [freeByMonth, getValues, originalAppointment.id])
  /* ── submit handler ──────────────────────────────────── */
  const onSubmit = ({ appointment_id }: FormFields) => {
    if (!appointment_id) return

    setIsInProgress()
    reschedule({
      current_appointment_id: originalAppointment.id,
      new_appointment_id: appointment_id,
    })
      .then(() => {
        onClose()
        onRescheduled?.()

      })
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }

  /* ── render ───────────────────────────────────────────── */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reprogramar turno #{originalAppointment.id}</DialogTitle>

      <DialogContent dividers>
        <AppointmentBriefCard
          title="Turno actual"
          appointmentId={originalAppointment.id}
          begins_at={originalAppointment.begins_at}
          comments={originalAppointment.comments}
        />

        <Spacer />

        {freeByMonth && (
          <>
            <DateCalendarControlled
              onMonthChange={(newDate) => setRefDate(newDate)}
              onYearChange={(newDate) => setRefDate(newDate)}
              onChangeCallback={handleDateChange}
              control={control}
              name="date"
              rules={{ ...rules.required() }}
              availableDays={availableDays(freeByMonth)}
            />
            <Spacer />

            <OptionToggleControlled
              control={control}
              name="appointment_id"
              orientation="vertical"
              options={appointmentOptions}
              rules={rules.required()}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <MuiButton onClick={onClose}>Cancelar</MuiButton>
        <Submit onClick={handleSubmit(onSubmit)}>Confirmar</Submit>
      </DialogActions>
    </Dialog>
  )
}

export default RescheduleDialog

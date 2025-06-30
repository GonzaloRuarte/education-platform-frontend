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
} from '@/mta_schedule/types'

/* ───────────────────────────────────────────────────────── */
import { APPOINTMENTS_PATH } from '@/mta_schedule/hooks'  // step-1 constant


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

  const { control, handleSubmit, getValues, watch } = useForm<FormFields>({
    defaultValues: {
      date: dayjs(originalAppointment.begins_at),
      appointment_id: undefined,
    },
  })

  /* free appointments for month/year of current date */
  const { data: freeByMonth } = useAppointmentFreeListByMonth({
    month: watch('date').month() + 1,
    year: watch('date').year(),
  })

  /* options for toggle */
  const [options, setOptions] = useState<Array<{ value: T_AppointmentId; label: string }>>([])

  /* whenever date or data changes, rebuild time-slot list */
  useEffect(() => {
    if (!freeByMonth) return
    const day = getValues('date').date()
    const available = freeByMonth[day] ?? []
    setOptions(
      Object.entries(distinctAvailableAppointments(available)).map(
        ([datetime, list]) => ({
          value: list[0].id,
          label: `${dayjs(datetime).format('HH:mm')} hs (${list.length})`,
        }),
      ),
    )
  }, [freeByMonth, watch('date')])

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
        />

        <Spacer />

        {freeByMonth && (
          <>
            <DateCalendarControlled
              control={control}
              name="date"
              rules={rules.required()}
              availableDays={availableDays(freeByMonth)}
              onMonthChange={() => {/* hook refetches automatically */}}
              onYearChange={() => {/* hook refetches automatically */}}
            />
            <Spacer />

            <OptionToggleControlled
              control={control}
              name="appointment_id"
              orientation="vertical"
              options={options}
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

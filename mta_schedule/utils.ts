import {
  APPOINTMENT_SCHEDULE_PROFILE,
  APPOINTMENT_SCHEDULE_PROFILE_LEGACY,
  APPOINTMENT_SLOTS_BY_PROFILE,
} from '@/mta_schedule/constants'
import {
  AppointmentOccurrenceStatus,
  AppointmentStatus,
  I_AppointmentDetail,
  I_AppointmentListItem,
  I_AppointmentsByMonthResponseData,
  T_AppointmentsAvailableList,
} from '@/mta_schedule/types'
import { sentence } from '@/shared/utils'
import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
require('dayjs/locale/es')

const BUENOS_AIRES_TIME_ZONE = 'America/Argentina/Buenos_Aires'

type T_AppointmentSlot = (typeof APPOINTMENT_SLOTS_BY_PROFILE)[keyof typeof APPOINTMENT_SLOTS_BY_PROFILE][number]

const activeAppointmentSlots = (): ReadonlyArray<T_AppointmentSlot> => {
  return APPOINTMENT_SLOTS_BY_PROFILE[APPOINTMENT_SCHEDULE_PROFILE] ?? APPOINTMENT_SLOTS_BY_PROFILE[APPOINTMENT_SCHEDULE_PROFILE_LEGACY]
}

const formatSlotTime = (date: Dayjs, hour: number, minute: number) =>
  date.hour(hour).minute(minute).second(0).millisecond(0).format('HH:mm')

const appointmentDateFromISOString = (dateString: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUENOS_AIRES_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(dateString))

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return dayjs(`${values.year}-${values.month}-${values.day}`)
}

const slotLabelFromBeginning = (beginsAt: string) => {
  const parsedParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUENOS_AIRES_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(beginsAt))
  const parsedValues = Object.fromEntries(parsedParts.map((part) => [part.type, part.value]))
  const parsed = dayjs(`${parsedValues.year ?? '1970'}-01-01T${parsedValues.hour}:${parsedValues.minute}:00`)
  const slot = activeAppointmentSlots().find(([[startHour, startMinute]]) => parsed.hour() === startHour && parsed.minute() === startMinute)

  if (slot === undefined) {
    return formatSlotTime(parsed, parsed.hour(), parsed.minute())
  }

  const [[startHour, startMinute], [endHour, endMinute]] = slot
  return `${formatSlotTime(parsed, startHour, startMinute)} a ${formatSlotTime(parsed, endHour, endMinute)} hrs`
}

const hoursOptions = () => {
  return activeAppointmentSlots().map(([[startHour, startMinute], [endHour, endMinute]]) => ({
    value: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
    label: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} a ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} hrs`,
  }))
}

const distinctAvailableAppointments = (appointments: T_AppointmentsAvailableList) => {
  const distinct: Record<string, T_AppointmentsAvailableList> = {}
  appointments.forEach((a) => {
    if (!(a.begins_at in distinct)) {
      distinct[a.begins_at] = []
    }
    distinct[a.begins_at].push(a)
  })

  return distinct
}

const combinedDateAndTime = (args: { date: Dayjs; time: string }) =>
  dayjs(args.date.format('YYYY-MM-DD'))
    .hour(parseInt(args.time.split(':')[0]))
    .minute(parseInt(args.time.split(':')[1]))
    .toISOString()

/**
 * Converts I_AppointmentsByMonthResponseData into a key-value object
 * where keys are appointment IDs and values are always true.
 * @param data - The input data of type I_AppointmentsByMonthResponseData.
 * @returns An object with appointment IDs as keys and true as values.
 */
const availableDays = (data: I_AppointmentsByMonthResponseData): Record<number, true> => {
  const result: Record<number, true> = {}

  Object.keys(data).forEach((key) => {
    result[key] = true
  })

  return result
}

const appointmentFormattedStringDate = (dateString: string): string => {
  return sentence(dayjs(dateString).locale('es').format('LLLL'))
}

const appointmentAlreadyStarted = (datetimeString) => {
  return dayjs(datetimeString).isBefore(dayjs())
}

const appointmentShowPostProcessingResources = (appointment: I_AppointmentListItem | I_AppointmentDetail) => {
  return (
    appointment.occurrence_status === AppointmentOccurrenceStatus.past &&
    appointment.status === AppointmentStatus.approved
  )
}

export {
  appointmentDateFromISOString,
  hoursOptions,
  combinedDateAndTime,
  availableDays,
  appointmentFormattedStringDate,
  appointmentAlreadyStarted,
  appointmentShowPostProcessingResources,
  distinctAvailableAppointments,
  slotLabelFromBeginning,
}

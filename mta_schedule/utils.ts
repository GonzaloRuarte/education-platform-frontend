import {
  AppointmentOccurrenceStatus,
  AppointmentStatus,
  I_AppointmentDetail,
  I_AppointmentListItem,
  I_AppointmentsByMonthResponseData,
} from '@/mta_schedule/types'
import { sentence } from '@/shared/utils'
import dayjs, { Dayjs } from 'dayjs'
require('dayjs/locale/es')

const hoursOptions = () => {
  const options: Array<{ value: string; label: string }> = []

  options.push({ value: '08:00', label: 'Turno Mañana' })
  options.push({ value: '13:00', label: 'Turno Tarde' })

  return options
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
  hoursOptions,
  combinedDateAndTime,
  availableDays,
  appointmentFormattedStringDate,
  appointmentAlreadyStarted,
  appointmentShowPostProcessingResources,
}

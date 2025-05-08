import { useAuthResources } from '@/mta_auth/hooks'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosPost } from '@/shared/data/axios'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { T_EmptyPayload } from '@/shared/types'

// const DEV_PATH = '/development'
const DEV_APPOINTMENT_FAKERIZE_PATH = '/development/appointment/fakerize/'
const DEV_APPOINTMENT_MAKE_AVAILABLE_NOW_PATH = '/development/appointment/make-available-now/'
const DEV_APPOINTMENT_SET_AS_FINISHED_PATH = '/development/appointment/set-as-finished/'

const useDevAppointmentFakerize = actionHookV3<typeof DEV_APPOINTMENT_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_APPOINTMENT_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)

const useDevAppointmentMakeAvailableNow = actionHookV3<
  typeof DEV_APPOINTMENT_MAKE_AVAILABLE_NOW_PATH,
  { appointment_id: T_AppointmentId },
  { message: string }
>(DEV_APPOINTMENT_MAKE_AVAILABLE_NOW_PATH, axiosPost, useAuthResources)
const useDevAppointmentSetAsFinished = actionHookV3<
  typeof DEV_APPOINTMENT_SET_AS_FINISHED_PATH,
  { appointment_id: T_AppointmentId },
  { message: string }
>(DEV_APPOINTMENT_SET_AS_FINISHED_PATH, axiosPost, useAuthResources)

export { useDevAppointmentFakerize, useDevAppointmentMakeAvailableNow, useDevAppointmentSetAsFinished }

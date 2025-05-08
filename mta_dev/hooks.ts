import { useAuthResources } from '@/mta_auth/hooks'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosPost } from '@/shared/data/axios'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { T_EmptyPayload } from '@/shared/types'

// const DEV_PATH = '/development'
const DEV_APPOINTMENT_FAKERIZE_PATH = '/development/appointments/fakerize/'
const DEV_APPOINTMENT_MAKE_AVAILABLE_NOW_PATH = '/development/appointments/make-available-now/'
const DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_5_MINUTES_PATH =
  '/development/appointments/make-resolutions-left-5-minutes/'
const DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_10_SECONDS_PATH =
  '/development/appointments/make-resolutions-left-10-seconds/'
const DEV_APPOINTMENT_SET_AS_FINISHED_PATH = '/development/appointments/set-as-finished/'

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

const useDevAppointmentMakeResolutionsLeft5Minutes = actionHookV3<
  typeof DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_5_MINUTES_PATH,
  { appointment_id: T_AppointmentId },
  { message: string }
>(DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_5_MINUTES_PATH, axiosPost, useAuthResources)
const useDevAppointmentMakeResolutionsLeft10Seconds = actionHookV3<
  typeof DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_10_SECONDS_PATH,
  { appointment_id: T_AppointmentId },
  { message: string }
>(DEV_APPOINTMENT_MAKE_RESOLUTIONS_LEFT_10_SECONDS_PATH, axiosPost, useAuthResources)

const DEV_SCHOOLS_FAKERIZE_PATH = '/development/schools/fakerize/'
const DEV_SCHOOLS_FAKERIZE_COMPLETE_PATH = '/development/schools/fakerize-complete/'

const useDevSchoolsFakerize = actionHookV3<typeof DEV_SCHOOLS_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_SCHOOLS_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)
const useDevSchoolsFakerizeComplete = actionHookV3<
  typeof DEV_SCHOOLS_FAKERIZE_COMPLETE_PATH,
  T_EmptyPayload,
  T_EmptyPayload
>(DEV_SCHOOLS_FAKERIZE_COMPLETE_PATH, axiosPost, useAuthResources)

const DEV_EVALUATIONS_FAKERIZE_PATH = '/development/evaluations/fakerize/'
const DEV_EVALUATIONS_FAKERIZE_COMPLETE_PATH = '/development/evaluations/fakerize-complete/'

const useDevEvaluationsFakerize = actionHookV3<typeof DEV_EVALUATIONS_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_EVALUATIONS_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)

const useDevEvaluationsFakerizeComplete = actionHookV3<
  typeof DEV_EVALUATIONS_FAKERIZE_COMPLETE_PATH,
  T_EmptyPayload,
  T_EmptyPayload
>(DEV_EVALUATIONS_FAKERIZE_COMPLETE_PATH, axiosPost, useAuthResources)

const DEV_REPORTS_FAKERIZE_PATH = '/development/reports/fakerize/'

const useDevReportsFakerize = actionHookV3<typeof DEV_REPORTS_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_REPORTS_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)

export {
  useDevAppointmentFakerize,
  useDevAppointmentMakeAvailableNow,
  useDevAppointmentSetAsFinished,
  useDevAppointmentMakeResolutionsLeft5Minutes,
  useDevSchoolsFakerize,
  useDevSchoolsFakerizeComplete,
  useDevEvaluationsFakerize,
  useDevEvaluationsFakerizeComplete,
  useDevAppointmentMakeResolutionsLeft10Seconds,
  useDevReportsFakerize,
}

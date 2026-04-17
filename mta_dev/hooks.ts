import { useAuthResources } from '@/mta_auth/hooks'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosDelete, axiosGet, axiosGetBlob, axiosPost } from '@/shared/data/axios'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { T_EmptyPayload } from '@/shared/types'
import { apiUrl } from '@/config'

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

const DEV_APPOINTMENT_PREPARE_TEST_PATH = '/development/appointments/prepare-test/'

const useDevAppointmentPrepareTest = actionHookV3<
  typeof DEV_APPOINTMENT_PREPARE_TEST_PATH,
  T_EmptyPayload,
  { message: string; appointment_id: number; pin: number; student_personal_id: string }
>(DEV_APPOINTMENT_PREPARE_TEST_PATH, axiosPost, useAuthResources)

const DEV_APPOINTMENT_LIST_TEST_PATH = '/development/appointments/list-test/'

const useDevAppointmentListTest = actionHookV3<
  typeof DEV_APPOINTMENT_LIST_TEST_PATH,
  undefined,
  { appointments: { id: number; label: string }[] }
>(DEV_APPOINTMENT_LIST_TEST_PATH, axiosGet, useAuthResources)

const DEV_APPOINTMENT_DELETE_TEST_PATH = '/development/appointments/delete-test/'

const useDevAppointmentDeleteTest = actionHookV3<
  typeof DEV_APPOINTMENT_DELETE_TEST_PATH,
  T_EmptyPayload,
  { message: string }
>(DEV_APPOINTMENT_DELETE_TEST_PATH, axiosDelete, useAuthResources)

const DEV_REPORTS_FAKERIZE_PATH = '/development/reports/fakerize/'

const DEV_REPORTS_EXPORT_STEP_ZERO_PATH = '/development/reports/export-step-zero/'

const useDevReportsFakerize = actionHookV3<typeof DEV_REPORTS_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_REPORTS_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)

function useDevReportsExportStepZero() {
  const auth = useAuthResources()

  const executeAction = async () => {
    const blob = await axiosGetBlob({
      url: apiUrl(DEV_REPORTS_EXPORT_STEP_ZERO_PATH),
      requestSetup: auth,
    })

    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    const suffix = new Date().toISOString().slice(0, 19).replaceAll(':', '-').replace('T', '_')
    a.download = `paso_0_respuestas_desde_20260401_${suffix}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(blobUrl)

    return { message: 'Descarga iniciada.' }
  }

  return { executeAction }
}

export {
  useDevAppointmentDeleteTest,
  useDevAppointmentListTest,
  useDevAppointmentFakerize,
  useDevAppointmentMakeAvailableNow,
  useDevAppointmentPrepareTest,
  useDevAppointmentSetAsFinished,
  useDevAppointmentMakeResolutionsLeft5Minutes,
  useDevSchoolsFakerize,
  useDevSchoolsFakerizeComplete,
  useDevEvaluationsFakerize,
  useDevEvaluationsFakerizeComplete,
  useDevAppointmentMakeResolutionsLeft10Seconds,
  useDevReportsFakerize,
  useDevReportsExportStepZero,
}

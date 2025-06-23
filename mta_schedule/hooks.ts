import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_AppointmentAddStudents_RequestData,
  I_AppointmentApprove_RequestData,
  I_AppointmentCreateRequestData,
  I_AppointmentDetail,
  I_AppointmentReject_RequestData,
  I_AppointmentRequest_RequestData,
  I_AppointmentsByMonthResponseData,
  T_AppointmentId,
  T_AppointmentList,
  I_AppointmentReschedule_RequestData,
} from '@/mta_schedule/types'
import pages, { appointmentsEditStudentsPath, appointmentsProcessPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  actionHook,
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  dynamicNavigationHook,
  getHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
  useInProgress,
} from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { I_CreationCommonResponse, T_VoidFn } from '@/shared/types'

// Data Service
const APPOINTMENTS_PATH = '/appointments'
const useAppointmentList = listHook<T_AppointmentList>(APPOINTMENTS_PATH, axiosGet, useAuthResources)
const useAppointmentListByUserSchool = listHook<T_AppointmentList>(
  `${APPOINTMENTS_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)
const useAppointmentCreate = creationHook<I_AppointmentCreateRequestData, I_CreationCommonResponse>(
  APPOINTMENTS_PATH,
  axiosPost,
  useAuthResources,
)
const useAppointmentUpdate = updateHook<T_AppointmentId, I_AppointmentCreateRequestData, I_CreationCommonResponse>(
  APPOINTMENTS_PATH,
  axiosPatch,
  useAuthResources,
)
const useAppointmentDelete = deletionHook<T_AppointmentId>(APPOINTMENTS_PATH, axiosDelete, useAuthResources)
const useAppointmentBatchDelete = batchDeletionHook<T_AppointmentId>(APPOINTMENTS_PATH, axiosDelete, useAuthResources)
const useAppointmentDetail = detailHook<T_AppointmentId, I_AppointmentDetail>(
  APPOINTMENTS_PATH,
  axiosGet,
  useAuthResources,
)
const useAppointmentFreeListByMonth = getHook<I_AppointmentsByMonthResponseData, { year: number; month: number }>(
  `${APPOINTMENTS_PATH}/free-appointments-by-month`,
  axiosGet,
  useAuthResources,
)
const useAppointmentRequest = actionHook<I_AppointmentRequest_RequestData, I_AppointmentDetail>(
  `${APPOINTMENTS_PATH}/request`,
  axiosPost,
  useAuthResources,
)
const useAppointmentApprove = actionHook<I_AppointmentApprove_RequestData, I_AppointmentDetail>(
  `${APPOINTMENTS_PATH}/approve`,
  axiosPost,
  useAuthResources,
)
const useAppointmentReject = actionHook<I_AppointmentReject_RequestData, I_AppointmentDetail>(
  `${APPOINTMENTS_PATH}/reject`,
  axiosPost,
  useAuthResources,
)
const useAppointmentAddStudents = actionHook<I_AppointmentAddStudents_RequestData, I_AppointmentDetail>(
  `${APPOINTMENTS_PATH}/set-students`,
  axiosPost,
  useAuthResources,
)
const useAppointmentRequestPostProcess = (callback: T_VoidFn) => {
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const _useReqPP = actionHook<{ appointment_id: T_AppointmentId }, I_AppointmentDetail>(
    `${APPOINTMENTS_PATH}/request-post-process`,
    axiosPost,
    useAuthResources,
  )
  const appointmentRequestPostProcess = _useReqPP()
  return (data: { appointment_id: T_AppointmentId }) => {
    setIsInProgress()
    appointmentRequestPostProcess(data)
      .then(() => {
        successToast('Se ha solicitado el procesamiento del turno')
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsNotInProgress()
        callback()
      })
  }
}

const useAppointmentReschedule = actionHook<I_AppointmentReschedule_RequestData, I_AppointmentDetail>(
  `${APPOINTMENTS_PATH}/reschedule`,
  axiosPost,
  useAuthResources,
)

// Navigation
const useNavigateToAppointmentList = navigationHook(pages.D._.turnos.path)
const useNavigateToAppointmentProcess = dynamicNavigationHook(appointmentsProcessPath)
const useNavigateToAppointmentEditStudents = dynamicNavigationHook(appointmentsEditStudentsPath)
const useNavigateToAppointmentCreate = navigationHook(pages.D._.turnos._.agregar.path)
const useNavigateToAppointmentDetail = navigationWithIdHook(pages.D._.turnos.path)
const useNavigateToAppointmentHome = navigationHook(pages.D._.turnos.path)
const useNavigateToAppointmentUploadOfflineStates = navigationHook(pages.D._.turnos._.cargarResolucionesOffline.path)
const useNavigateToAppointmentRequest = navigationHook(pages.D._.turnos._.solicitar.path)

export {
  useAppointmentAddStudents,
  useAppointmentApprove,
  useAppointmentBatchDelete,
  useAppointmentCreate,
  useAppointmentDelete,
  useAppointmentDetail,
  useAppointmentFreeListByMonth,
  useAppointmentList,
  useAppointmentListByUserSchool,
  useAppointmentReject,
  useAppointmentRequest,
  useAppointmentUpdate,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentDetail,
  useNavigateToAppointmentEditStudents,
  useNavigateToAppointmentList,
  useNavigateToAppointmentProcess,
  useNavigateToAppointmentRequest,
  useNavigateToAppointmentHome,
  useNavigateToAppointmentUploadOfflineStates,
  useAppointmentRequestPostProcess,
  useAppointmentReschedule,
  APPOINTMENTS_PATH,
}

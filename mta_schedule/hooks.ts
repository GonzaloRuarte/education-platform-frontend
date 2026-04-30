import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_AppointmentAddStudents_RequestData,
  I_AppointmentApprove_RequestData,
  I_AppointmentCreateRequestData,
  I_AppointmentDetail,
  I_AppointmentAdminSchoolDashboardRow,
  I_AppointmentReject_RequestData,
  I_AppointmentRequest_RequestData,
  I_AppointmentsByMonthResponseData,
  T_AppointmentId,
  T_AppointmentList,
  I_AppointmentReschedule_RequestData,
  T_AppointmentSchoolCards,
} from '@/mta_schedule/types'
import pages, { appointmentAdminDashboardPath, appointmentsEditStudentsPath, appointmentsProcessPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost, axiosGetBlob } from '@/shared/data/axios'
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
import { useEffect, useState } from 'react'
import { apiUrl } from '@/config'

// Data Service
const APPOINTMENTS_PATH = '/appointments'
const useAppointmentList = listHook<T_AppointmentList>(APPOINTMENTS_PATH, axiosGet, useAuthResources)
const useAppointmentListByUserSchool = listHook<T_AppointmentSchoolCards>(
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
const useAppointmentAdminSchoolDashboard = getHook<Array<I_AppointmentAdminSchoolDashboardRow>>(
  `${APPOINTMENTS_PATH}/admin-school-dashboard`,
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


export interface I_AppointmentLatestExportStatus_Response {
  available: boolean
  generated_at: string | null
  download_url?: string
}

function useLatestAppointmentExport() {
  const auth = useAuthResources()
  const [loading, setLoading] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [latest, setLatest] = useState<I_AppointmentLatestExportStatus_Response | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    axiosGet<I_AppointmentLatestExportStatus_Response>({
      url: `${apiUrl(`${APPOINTMENTS_PATH}/latest-export-status`)}/`,
      requestSetup: auth,
      options: {} as any,
    })
      .then((resp) => {
        if (!cancelled) setLatest(resp)
      })
      .catch((error) => {
        if (!cancelled) {
          setLatest({ available: false, generated_at: null })
          handleServiceError(error as any)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [auth.accessToken, refreshToken])

  const refresh = () => setRefreshToken((v) => v + 1)

  const downloadLatest = async () => {
    if (!latest?.available) return
    setLoading(true)
    try {
      const blob = await axiosGetBlob({
        url: `${apiUrl(`${APPOINTMENTS_PATH}/latest-export-download`)}/`,
        requestSetup: auth,
      })
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const suffix = latest.generated_at ? latest.generated_at.slice(0, 10).replaceAll('-', '') : 'latest'
      a.download = `turnos_${suffix}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      handleServiceError(error as any)
    } finally {
      setLoading(false)
    }
  }

  return { latest, loading, refresh, downloadLatest }
}

const useNavigateToAppointmentList = navigationHook(pages.D._.turnos.path)
const useNavigateToAppointmentProcess = dynamicNavigationHook(appointmentsProcessPath)
const useNavigateToAppointmentEditStudents = dynamicNavigationHook(appointmentsEditStudentsPath)
const useNavigateToAppointmentCreate = navigationHook(pages.D._.turnos._.agregar.path)
const useNavigateToAppointmentDetail = navigationWithIdHook(pages.D._.turnos.path)
const useNavigateToAppointmentHome = navigationHook(pages.D._.turnos.path)
const useNavigateToAppointmentUploadOfflineStates = navigationHook(pages.D._.turnos._.cargarResolucionesOffline.path)
const useNavigateToAppointmentRequest = navigationHook(pages.D._.turnos._.solicitar.path)
const useNavigateToAppointmentAdminDashboard = navigationHook(appointmentAdminDashboardPath)

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
  useAppointmentAdminSchoolDashboard,
  useAppointmentUpdate,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentDetail,
  useNavigateToAppointmentEditStudents,
  useNavigateToAppointmentList,
  useNavigateToAppointmentProcess,
  useNavigateToAppointmentRequest,
  useNavigateToAppointmentAdminDashboard,
  useNavigateToAppointmentHome,
  useNavigateToAppointmentUploadOfflineStates,
  useAppointmentRequestPostProcess,
  useAppointmentReschedule,
  APPOINTMENTS_PATH,
  useLatestAppointmentExport,
}

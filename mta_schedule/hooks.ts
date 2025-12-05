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
  T_AppointmentSchoolCards,
} from '@/mta_schedule/types'
import pages, { appointmentsEditStudentsPath, appointmentsProcessPath } from '@/pages'
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
import { useState, useRef } from 'react'
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


export interface I_AppointmentExport_RequestData {
  filters?: string
  sort?: string
}

/** What the export endpoint returns when starting the job */
export interface I_AppointmentExport_Response {
  job_id: number
  status: string
}

/** What the status endpoint returns */
export interface I_AppointmentExportStatus_Response {
  job_id: number
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'
  total_rows: number
  error_message?: string
  download_url?: string
}

/**
 * Hook to start the export job.
 * Uses the same pattern as useAppointmentApprove, etc.
 */
export const useAppointmentExport = actionHook<
  I_AppointmentExport_RequestData,
  I_AppointmentExport_Response
>(`${APPOINTMENTS_PATH}/export`, axiosPost, useAuthResources)

/**
 * Hook to query the export status.
 * Reuses axiosGet + apiUrl so it hits the same backend as everything else.
 */
export const useAppointmentExportStatus = () => {
  const requestSetup = useAuthResources()

  return (jobId: number | string) => {
    return axiosGet<I_AppointmentExportStatus_Response>({
      url: `${apiUrl(`${APPOINTMENTS_PATH}/export-status`)}/`,
      requestSetup,
      options: {
        // axiosGet expects options and will turn filters into query params
        filters: { job_id: jobId },
      } as any,
    })
  }
}


function useExportAppointments(list: any) {
  const [exporting, setExporting] = useState(false)
  const pollRef = useRef<number | null>(null)
  const auth = useAuthResources();
  const startExportRequest = useAppointmentExport()
  const checkStatus = useAppointmentExportStatus()

  const startExport = async () => {
    if (exporting) return
    setExporting(true)

    // Pull filters/sort from whatever the list hook exposes.
    // Adjust these lines if you know the exact shape.
    const filtersJson =
      list?.filtersJson ??
      list?.grid?.filtersJson ??
      list?.query?.filtersJson

    const sortJson =
      list?.sortJson ??
      list?.grid?.sortJson ??
      list?.query?.sortJson

    // 1) Start export job (POST → .../export/)
    const { job_id } = await startExportRequest({
      filters: filtersJson,
      sort: sortJson,
    })

    const stop = () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
      pollRef.current = null
    }

    const poll = async () => {
      try {
        // 2) Ask backend about status (GET → .../export-status/?job_id=...)
        const st = await checkStatus(job_id)

        if (st.status === 'DONE') {
          const downloadUrl = apiUrl(`${APPOINTMENTS_PATH}/export-download`) + `/?job_id=${job_id}`;

          const blob = await axiosGetBlob({
            url: downloadUrl,
            requestSetup: auth,   // from useAuthResources()
          });

          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `turnos_${job_id}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(blobUrl);

          stop();
          setExporting(false);
        } else if (st.status === 'FAILED') {
          stop()
          setExporting(false)
          alert(`Error exportando archivo: ${st.error_message || 'Error desconocido'}`)
        }
      } catch {
        // transient error; ignore and let next poll try again
      }
    }

    pollRef.current = window.setInterval(poll, 1500)
  }

  return { startExport, exporting }
}

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
  useExportAppointments,
}

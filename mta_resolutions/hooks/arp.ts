import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_AppointmentResolutionProcessDetail,
  T_AppointmentResolutionProcessId,
  T_AppointmentResolutionProcessList,
} from '@/mta_resolutions/types/arp'
import pages from '@/pages'
import { axiosGet } from '@/shared/data/axios'
import { detailHook, listHook, navigationHook, navigationWithIdHook } from '@/shared/hooks'

const APPOINTMENT_RESOLUTION_PROCESSES_PATH = '/appointment-resolution-processes'

const useARPList = listHook<T_AppointmentResolutionProcessList>(
  APPOINTMENT_RESOLUTION_PROCESSES_PATH,
  axiosGet,
  useAuthResources,
)
const useARPListByUserSchool = listHook<T_AppointmentResolutionProcessList>(
  `${APPOINTMENT_RESOLUTION_PROCESSES_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)

const useARPDetail = detailHook<T_AppointmentResolutionProcessId, I_AppointmentResolutionProcessDetail>(
  APPOINTMENT_RESOLUTION_PROCESSES_PATH,
  axiosGet,
  useAuthResources,
)

const useNavigateToARPList = navigationHook(pages.D._.procesosDeEvaluacion.path)
const useNavigateToARPDetail = navigationWithIdHook(pages.D._.procesosDeEvaluacion.path)

export { useARPList, useARPDetail, useNavigateToARPList, useNavigateToARPDetail, useARPListByUserSchool }

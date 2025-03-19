import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_AppointmentCreateRequestData,
  I_AppointmentDetail,
  T_AppointmentId,
  T_AppointmentList,
} from '@/mta_schedule/types'
import pages from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

// Data Service
const APPOINTMENTS_PATH = '/appointments'
const useAppointmentList = listHook<T_AppointmentList>(APPOINTMENTS_PATH, axiosGet, useAuthResources)
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

// Navigation
const useNavigateToAppointmentList = navigationHook(pages.D._.turnos.path)
const useNavigateToAppointmentDetail = navigationWithIdHook(pages.D._.turnos.path)
const useNavigateToAppointmentCreate = navigationHook(pages.D._.turnos._.agregar.path)

export {
  useAppointmentBatchDelete,
  useAppointmentCreate,
  useAppointmentDelete,
  useAppointmentDetail,
  useAppointmentList,
  useAppointmentUpdate,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentDetail,
  useNavigateToAppointmentList,
}

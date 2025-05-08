import { useAuthResources } from '@/mta_auth/hooks'
import { axiosPost } from '@/shared/data/axios'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { T_EmptyPayload } from '@/shared/types'

const DEV_PATH = '/development'
const DEV_APPOINTMENT_FAKERIZE_PATH = '/development/appointment/fakerize/'

const useDevAppointmentFakerize = actionHookV3<typeof DEV_APPOINTMENT_FAKERIZE_PATH, T_EmptyPayload, T_EmptyPayload>(
  DEV_APPOINTMENT_FAKERIZE_PATH,
  axiosPost,
  useAuthResources,
)

export { useDevAppointmentFakerize }

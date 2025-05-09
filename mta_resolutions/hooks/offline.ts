import { useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import { axiosPost } from '@/shared/data/axios'
import { creationHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

export type T_ResolutionUploadOfflineData = FormData

const RESOLUTIONS_PATH = '/resolutions'

export const useResolutionUploadOfflineState = creationHook<T_ResolutionUploadOfflineData, I_CreationCommonResponse>(
  `${RESOLUTIONS_PATH}/upload-offline-state`,
  axiosPost,
  useRequestSetupWithMultipart,
)

'use client'

import { useAuthResources } from '@/mta_auth/hooks'
import { I_ResolutionInspectionQuery, I_ResolutionInspectionResponse } from '@/mta_resolutions/types/inspection'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import { useState } from 'react'

const RESOLUTION_INSPECTION_PATH = '/resolutions/last-state-by-student'

const useResolutionInspection = () => {
  const requestSetup = useAuthResources()
  const [data, setData] = useState<I_ResolutionInspectionResponse | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const fetchResolutionInspection = async ({ personal_id, appointment_id }: I_ResolutionInspectionQuery) => {
    setIsLoading(true)
    try {
        const queryParams = new URLSearchParams({
          personal_id,
          ...(appointment_id !== undefined ? { appointment_id: String(appointment_id) } : {}),
        })

        const response = await axiosGet<I_ResolutionInspectionResponse>({
          url: `${apiUrl(RESOLUTION_INSPECTION_PATH)}/?${queryParams.toString()}`,
          requestSetup,
          options: {},
        })
      setData(response)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const clear = () => setData(undefined)

  return {
    data,
    isLoading,
    fetchResolutionInspection,
    clear,
  }
}

export { useResolutionInspection }

import { I_AuthData } from '@/mta_auth/types'
import { T_GetMethod } from '@/shared/data/types'
import { listService } from '@/shared/service'
import { T_ServiceHook } from '@/shared/types'
import { useState } from 'react'

const useInProgress = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}

const listHook = <T_Response>(endpoint: string, getMethod: T_GetMethod, useAuthData: () => I_AuthData) => {
  const useList: T_ServiceHook<T_Response> = () => {


    const { accessToken, refreshToken } = useAuthData()

    return listService<T_Response>(endpoint, getMethod)({ accessToken, refreshToken })
  }
  return useList
}

export {
  useInProgress, listHook
}
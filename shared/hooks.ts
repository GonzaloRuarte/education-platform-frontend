import { I_AuthResources } from '@/mta_auth/types'
import { pages } from '@/pages'
import { T_GetMethod } from '@/shared/data/types'
import { listService } from '@/shared/service'
import { T_ServiceHook } from '@/shared/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const useInProgress = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}

const listHook = <T_Response>(endpoint: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ServiceHook<T_Response> = () => {
    const { accessToken, refreshToken, refresh, handleFatal401Error } = useAuthResources()

    return listService<T_Response>(endpoint, getMethod)({ accessToken, refreshToken, refresh, handleFatal401Error })
  }
  return useList
}

const useNavigateToHome = () => {
  const router = useRouter()
  const navigateToHome = () => {
    router.push(pages.D.path)
  }
  return { navigateToHome }
}

export { useNavigateToHome }

export { listHook, useInProgress }

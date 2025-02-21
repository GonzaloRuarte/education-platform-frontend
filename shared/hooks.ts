import { I_AuthData, I_AuthResources } from '@/mta_auth/types'
import { T_GetMethod } from '@/shared/data/types'
import { listService } from '@/shared/service'
import { T_ServiceHook } from '@/shared/types'
import { useState } from 'react'
import { pages } from '@/pages'
import { useRouter } from 'next/navigation'

const useInProgress = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}

const listHook = <T_Response>(
  endpoint: string,
  getMethod: T_GetMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useList: T_ServiceHook<T_Response> = () => {
    const { accessToken, refreshToken, refresh } = useAuthResources()

    return listService<T_Response>(
      endpoint,
      getMethod,
    )({ accessToken, refreshToken, refresh })
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

export { useInProgress, listHook }

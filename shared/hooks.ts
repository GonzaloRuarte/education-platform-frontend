import { I_AuthResources } from '@/mta_auth/types'
import { pages } from '@/pages'
import { T_DeleteMethod, T_GetMethod, T_PostMethod } from '@/shared/data/types'
import { deletionService, detailService, listService, postService } from '@/shared/service'
import { T_CreateServiceHook, T_ListServiceHook } from '@/shared/types'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const useInProgress = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}

const listHook = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHook<T_Response> = () => {
    const authResources = useAuthResources()

    return listService<T_Response>(entityPath, getMethod)(authResources)
  }
  return useList
}

const creationHook = <T_RequestData, T_Response>(
  entityPath: string,
  postMethod: T_PostMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useCreate: T_CreateServiceHook<T_RequestData, T_Response> = () => {
    const authResources = useAuthResources()

    return postService<T_RequestData, T_Response>(entityPath, postMethod)(authResources)
  }
  return useCreate
}

const deletionHook = <T_Id, T_Response>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useDelete: T_CreateServiceHook<T_Id, T_Response> = () => {
    const authResources = useAuthResources()

    return deletionService<T_Id, T_Response>(entityPath, deleteMethod)(authResources)
  }
  return useDelete
}

const detailHook = <T_Id, T_Response>(
  entityPath: string,
  getMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useDetail = () => {
    const authResources = useAuthResources()

    return detailService<T_Id, T_Response>(entityPath, getMethod)(authResources)
  }
  return useDetail
}
const useNavigateToHome = () => {
  const router = useRouter()
  return () => {
    router.push(pages.D.path)
  }
}

export { useNavigateToHome }

export { creationHook, deletionHook, listHook, useInProgress, detailHook }

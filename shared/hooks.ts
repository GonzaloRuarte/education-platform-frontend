import { I_AuthResources } from '@/mta_auth/types'
import { pathWithId, pages } from '@/pages'
import { T_DeleteMethod, T_GetMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import {
  deletionService,
  detailService,
  listService,
  postService,
  updateService,
  batchDeletionService,
} from '@/shared/service'
import { useStore } from '@/shared/state'
import {
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_ListServiceHook,
  T_UpdateServiceHook,
} from '@/shared/types'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const useInProgressLocal = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}
const useInProgress = () => {
  const isInProgress = useStore((state) => state.isInProgress)
  const setIsInProgress = useStore((state) => state.setIsInProgress)
  return { isInProgress, setIsInProgress }
}

const listHook = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHook<T_Response> = () => {
    return listService<T_Response>(entityPath, getMethod)(useAuthResources())
  }
  return useList
}

const creationHook = <T_RequestData, T_Response>(
  entityPath: string,
  postMethod: T_PostMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useCreate: T_CreateServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(entityPath, postMethod)(useAuthResources())
  }
  return useCreate
}

const deletionHook = <T_Id, T_Response>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_DeletionServiceHook<T_Id, T_Response> => {
  return () => deletionService<T_Id, T_Response>(entityPath, deleteMethod)(useAuthResources())
}

const batchDeletionHook = <T_Id, T_Response>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_BatchDeletionServiceHook<T_Id, T_Response> => {
  return () => batchDeletionService<T_Id, T_Response>(entityPath, deleteMethod)(useAuthResources())
}

const detailHook = <T_Id, T_Response>(
  entityPath: string,
  getMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useDetail = () => {
    return detailService<T_Id, T_Response>(entityPath, getMethod)(useAuthResources())
  }
  return useDetail
}

const updateHook = <T_Id, T_RequestData, T_Response>(
  entityPath: string,
  patchMethod: T_PatchMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => {
    return updateService<T_Id, T_RequestData, T_Response>(entityPath, patchMethod)(useAuthResources())
  }
  return useUpdate
}

const navigationHook = (path: string) => {
  return () => {
    const router = useRouter()
    return () => {
      router.push(path)
    }
  }
}

const navigationWithIdHook = (path: string) => {
  return () => {
    const router = useRouter()

    return (id: string | number) => {
      router.push(pathWithId(path, id))
    }
  }
}

const useNavigateToHome = navigationHook(pages.D.path)

export {
  useNavigateToHome,
  creationHook,
  deletionHook,
  listHook,
  updateHook,
  batchDeletionHook,
  useInProgress,
  useInProgressLocal,
  detailHook,
  navigationHook,
  navigationWithIdHook,
}

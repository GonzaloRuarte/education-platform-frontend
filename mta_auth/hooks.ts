import { apiUrl } from '@/config'
import {
  I_AuthData,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
  I_AuthResources,
  T_AllowedAccessGroups,
} from '@/mta_auth/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { T_TokenRefresher } from '@/shared/data/types'
import log from '@/shared/log'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { errorToast, successToast } from '@/shared/toasts'
import { intersection } from '@/shared/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const useIsAuthorized = () => {
  const [useFastMethod, setUseFastMethod] = useState(true)

  const isAuthorizedWithFastNonReactiveMethod = useStore.getState().accessToken !== undefined
  const isAuthorizedWithReactiveMethod = useStore((state) => state.accessToken !== undefined)

  useEffect(() => {
    const to = setTimeout(() => setUseFastMethod(false), 100)
    return () => clearTimeout(to)
  }, [])

  return useFastMethod ? isAuthorizedWithFastNonReactiveMethod : isAuthorizedWithReactiveMethod
}

const useUserAccessGroups = () => useStore.getState().accessGroups

const useHasPermissions = (requiredAccesses: T_AllowedAccessGroups): boolean => {
  const userAccessGroups = useUserAccessGroups()

  if (userAccessGroups === undefined) return false
  if (requiredAccesses === undefined || requiredAccesses.length === 0) return true

  return intersection(requiredAccesses, userAccessGroups).length > 0
}

const useAuthData = (): I_AuthData => {
  const { accessGroups, accessToken, refreshToken } = useStore.getState()
  return { accessGroups, accessToken, refreshToken }
}

const useAuthResources = (): I_AuthResources => {
  const { accessGroups, accessToken, refreshToken } = useAuthData()
  const storeRefreshedToken = useStore((state) => state.storeRefreshedToken)
  const clearAuthData = useStore((state) => state.clearAuthData)

  const refresh: T_TokenRefresher = (postMethod) => async (data) => {
    return postMethod(apiUrl('/token/refresh/'), data).then((res) => {
      storeRefreshedToken(res.access)
      log.info('Auth Token succesfully refreshed')
      return res
    })
  }
  const handleFatal401Error = () => {
    clearAuthData()
    log.info("Auth Token couldn't be refreshed. Destroying session")
    errorToast('Error con tus credenciales de acceso. Inicia sesión nuevamente')
  }

  return { accessGroups, accessToken, refreshToken, refresh, handleFatal401Error }
}

const useLogout = () => {
  const router = useRouter()

  return () => {
    successToast('Sesión cerrada correctamente. Hasta Pronto!')
    useStore.getState().clearAuthData()
    router.push(pages.D._.login.path)
  }
}
const useStoreAuthData = () => useStore((state) => state.storeAuthData)

const useAuthorize = () => {
  const path = apiUrl('/token/')
  return postService<I_AuthorizeRequestData, I_AuthorizeResponseData>(path, axiosPost)()
}

const useNavigateToLogin = () => {
  const router = useRouter()
  const navigateToLogin = () => {
    router.push(pages.D._.login.path)
  }
  return { navigateToLogin }
}

export {
  useAuthData,
  useAuthorize,
  useAuthResources,
  useHasPermissions,
  useIsAuthorized,
  useLogout,
  useNavigateToLogin,
  useStoreAuthData,
  useUserAccessGroups,
}

import { apiUrl } from '@/config'
import { I_AuthData, I_AuthorizeRequestData, I_AuthorizeResponseData, I_AuthResources } from '@/mta_auth/types'
import { useUserStoreWhoIAmData } from '@/mta_users/hooks'
import { T_AllowedUserProfiles } from '@/mta_users/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { T_TokenRefresher } from '@/shared/data/types'
import log from '@/shared/log'
import { handleServiceError, postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { errorToast, successToast } from '@/shared/toasts'
import { intersection } from '@/shared/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const useIsAuthorized = () => {
  const [useFastMethod, setUseFastMethod] = useState(true)

  const isAuthorizedWithFastNonReactiveMethod = useStore.getState().auth_accessToken !== undefined
  const isAuthorizedWithReactiveMethod = useStore((state) => state.auth_accessToken !== undefined)

  useEffect(() => {
    const to = setTimeout(() => setUseFastMethod(false), 100)
    return () => clearTimeout(to)
  }, [])

  return useFastMethod ? isAuthorizedWithFastNonReactiveMethod : isAuthorizedWithReactiveMethod
}

const useUserProfiles = () => useStore.getState().auth_profiles
const useUserProfilesResources = () => {
  const profiles = useUserProfiles()
  return {
    profiles,
    isAdmin: profiles?.includes('admin'),
    isStudent: profiles?.includes('student'),
    isEvaluator: profiles?.includes('evaluator'),
    isSchoolStaff: profiles?.includes('school_staff'),
  }
}

const useHasPermissions = (requiredProfiles: T_AllowedUserProfiles): boolean => {
  const userProfiles = useUserProfiles()

  if (userProfiles === undefined) return false
  if (requiredProfiles === undefined || requiredProfiles.length === 0) return true

  return intersection(requiredProfiles, userProfiles).length > 0
}

const useAuthData = (): I_AuthData => {
  const { auth_profiles, auth_accessToken, auth_refreshToken } = useStore.getState()
  return {
    profiles: auth_profiles,
    accessToken: auth_accessToken,
    refreshToken: auth_refreshToken,
  }
}

const useAuthResources = (): I_AuthResources => {
  const { profiles, accessToken, refreshToken } = useAuthData()
  const storeRefreshedToken = useStore((state) => state.auth_storeRefreshedToken)
  const clearAuthData = useStore((state) => state.auth_clearAuthData)

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

  return { profiles, accessToken, refreshToken, refresh, handleFatal401Error }
}

const useLogout = (callbackPath: string = pages.D._.login.path) => {
  const router = useRouter()

  return () => {
    successToast('Sesión cerrada correctamente. Hasta Pronto!')
    useStore.getState().auth_clearAuthData()
    router.push(callbackPath)
  }
}
const useAuthStoreData = () => useStore((state) => state.auth_storeAuthData)

const useAuthorize = () => {
  return postService<I_AuthorizeRequestData, I_AuthorizeResponseData>('/token', axiosPost)()
}

const useAuthorizeAndStore = () => {
  const _authorize = useAuthorize()
  const storeAuthData = useAuthStoreData()
  const storeUserWhoIAmData = useUserStoreWhoIAmData()

  const authorize = (data: { username: string; password: string }) => {
    return _authorize(data)
      .then((res) => {
        successToast('¡Sesión iniciada correctamente, bienvenido/a!')
        storeAuthData({ accessToken: res.token.access, refreshToken: res.token.refresh, profiles: res.profiles })
        storeUserWhoIAmData({ ...res.user })
        return res
      })
      .catch(handleServiceError)
  }
  return { authorize }
}

export { useNavigateToLogin } from './navigation'

export {
  useAuthData,
  useAuthorize,
  useAuthorizeAndStore,
  useAuthResources,
  useHasPermissions,
  useIsAuthorized,
  useLogout,
  useAuthStoreData,
  useUserProfiles,
  useUserProfilesResources,
}

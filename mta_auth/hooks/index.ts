import { apiUrl } from '@/config'
import {
  I_AuthData,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
  I_AuthResources,
  I_ForgotAccessRequestData,
  I_ForgotAccessResponseData,
  I_PasswordResetConfirmRequestData,
  I_PasswordResetConfirmResponseData,
  T_UserCapability,
} from '@/mta_auth/types'
import { clearAllResolutionOfflineData } from '@/mta_resolutions/offlineStorage'
import { useSchoolStoreSchoolScope } from '@/mta_schools/hooks/state'

import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { I_RequestSetup, T_TokenRefresher } from '@/shared/data/types'

import { handleServiceError, postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { errorToast, successToast } from '@/shared/toasts'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const hasCompleteAuthData = (state: ReturnType<typeof useStore.getState>) =>
  state.auth_accessToken !== undefined && state.auth_profiles !== undefined && state.auth_capabilities !== undefined

const useIsAuthorized = () => {
  const [useFastMethod, setUseFastMethod] = useState(true)

  const isAuthorizedWithFastNonReactiveMethod = hasCompleteAuthData(useStore.getState())
  const isAuthorizedWithReactiveMethod = useStore((state) => hasCompleteAuthData(state))

  useEffect(() => {
    const to = setTimeout(() => setUseFastMethod(false), 100)
    return () => clearTimeout(to)
  }, [])

  return useFastMethod ? isAuthorizedWithFastNonReactiveMethod : isAuthorizedWithReactiveMethod
}

const useUserProfiles = () => useStore((state) => state.auth_profiles)
const useUserCapabilities = () => useStore((state) => state.auth_capabilities)

const useUserProfilesResources = () => {
  const profiles = useUserProfiles()
  const capabilities = useUserCapabilities()

  return {
    profiles,
    capabilities,
    isSuperuser: profiles?.includes('superuser'),
    isStudent: profiles?.includes('student'),
  }
}


const useHasCapabilities = (requiredCapabilities?: Array<T_UserCapability>): boolean => {
  const userCapabilities = useUserCapabilities()

  if (requiredCapabilities === undefined || requiredCapabilities.length === 0) return true
  if (userCapabilities === undefined) return false

  return requiredCapabilities.every((capability) => userCapabilities.includes(capability))
}

const useAuthData = (): I_AuthData => {
  const { auth_profiles, auth_accessToken, auth_refreshToken, auth_capabilities } = useStore.getState()
  return {
    profiles: auth_profiles,
    accessToken: auth_accessToken,
    refreshToken: auth_refreshToken,
    capabilities: auth_capabilities,
  }
}

const useAuthResources = (): I_AuthResources => {
  const { profiles, accessToken, refreshToken, capabilities } = useAuthData()
  const storeRefreshedToken = useStore((state) => state.auth_storeRefreshedToken)
  const clearAuthData = useStore((state) => state.auth_clearAuthData)

  const refresh: T_TokenRefresher = (postMethod) => async (data) => {
    return postMethod(apiUrl('/token/refresh/'), data).then((res) => {
      storeRefreshedToken(res.access)
      return res
    })
  }
  const handleFatal401Error = () => {
    clearAuthData()
    errorToast('Tu sesión anterior ha caducado. Ingresa nuevamente.')
  }

  return { profiles, capabilities, accessToken, refreshToken, refresh, handleFatal401Error }
}

const useRequestSetupWithMultipart = (): I_RequestSetup => {
  const authResources = useAuthResources()
  return { ...authResources, 'Content-Type': 'multipart/form-data' }
}

const useLogout = (callbackPath: string = pages.D._.login.path) => {
  const router = useRouter()

  const cleanTasks = () => {
    useStore.getState().auth_clearAuthData()
    useStore.getState().resolution_resetState()
    useStore.getState().school_resetState()
    useStore.getState().user_resetState()
    void clearAllResolutionOfflineData()
  }

  return () => {
    successToast('Sesión cerrada correctamente. Hasta Pronto!')
    cleanTasks()
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

  /*
  IMPORTANT: we won't use `import { useUserStoreWhoIAmData } from '@/mta_users/hooks'`
  here because it will create a circular dependency between mta_auth and mta_users.
  Instead, we will use the store directly.
  */
  const storeUserWhoIAmData = useStore((state) => state.user_storeWhoIAmData)

  const storeSchoolScope = useSchoolStoreSchoolScope()

  const authorize = (data: { username: string; password: string }) => {
    return _authorize(data)
      .then((res) => {
        successToast('¡Sesión iniciada correctamente, bienvenido/a!')
        storeAuthData({
          accessToken: res.token.access,
          refreshToken: res.token.refresh,
          profiles: res.profiles,
          capabilities: res.capabilities,
        })
        storeUserWhoIAmData({ ...res.user })
        storeSchoolScope({ accessibleSchools: res.schools, selectedSchool: res.school })
        return res
      })
      .catch(handleServiceError)
  }
  return { authorize }
}

const useForgotAccess = () =>
  postService<I_ForgotAccessRequestData, I_ForgotAccessResponseData>('/auth/forgot-access', axiosPost)()

const usePasswordResetConfirm = () =>
  postService<I_PasswordResetConfirmRequestData, I_PasswordResetConfirmResponseData>(
    '/auth/password-reset-confirm',
    axiosPost,
  )()

export { useNavigateToLogin } from './navigation'

export {
  useAuthData,
  useAuthorize,
  useAuthorizeAndStore,
  useAuthResources,
  useHasCapabilities,
  useIsAuthorized,
  useLogout,
  useAuthStoreData,
  useUserProfiles,
  useUserCapabilities,
  useUserProfilesResources,
  useRequestSetupWithMultipart,
  useForgotAccess,
  usePasswordResetConfirm,
}

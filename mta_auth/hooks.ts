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
import { successToast } from '@/shared/toasts'
import { intersection } from '@/shared/utils'
import { useRouter } from 'next/navigation'

const useIsAuthorized = () => useStore.getState().accessToken !== undefined

const useUserAccessGroups = () => useStore.getState().accessGroups

const useHasPermissions = (requiredAccesses: T_AllowedAccessGroups): boolean => {
  const userAccessGroups = useUserAccessGroups()

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

  const refresh: T_TokenRefresher = (postMethod) => async (data) => {
    log.info('Auth Token succesfully refreshed')
    return postMethod('http://localhost:8000/api/token/refresh/', data).then((res) => {
      storeRefreshedToken(res.access)
      return res
    })
  }

  return { accessGroups, accessToken, refreshToken, refresh }
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
  const path = 'http://localhost:8000/api/token/'
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

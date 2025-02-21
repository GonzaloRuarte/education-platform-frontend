import {
  I_AuthData,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
  T_AllowedAccessGroups,
} from '@/mta_auth/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'
import { intersection } from '@/shared/utils'
import { useRouter } from 'next/navigation'

const useIsAuthorized = () =>
  useStore((state) => state.accessToken !== undefined)

const useUserAccessGroups = () => useStore((state) => state.accessGroups)

const useHasPermissions = (
  requiredAccesses: T_AllowedAccessGroups,
): boolean => {
  const userAccessGroups = useUserAccessGroups()

  if (requiredAccesses === undefined || requiredAccesses.length === 0)
    return true

  return intersection(requiredAccesses, userAccessGroups).length > 0
}

const useAuthData = (): I_AuthData => {
  const { accessGroups, accessToken, refreshToken } = useStore.getState()
  return { accessGroups, accessToken, refreshToken }
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
  return postService<I_AuthorizeRequestData, I_AuthorizeResponseData>(
    path,
    axiosPost,
  )()
}

const useNavigateToLogin = () => {
  const router = useRouter()
  const navigateToLogin = () => {
    router.push(pages.D._.login.path)
  }
  return { navigateToLogin }
}

export {
  useIsAuthorized,
  useAuthData,
  useAuthorize,
  useStoreAuthData,
  useLogout,
  useNavigateToLogin,
  useUserAccessGroups,
  useHasPermissions,
}

import { I_AuthorizeRequestData, I_AuthorizeResponseData } from '@/mta_auth/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/fetchers'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { useRouter } from 'next/navigation'

const useIsAuthorized = () => useStore.getState().isAuthorized
const useAuthData = () => useStore.getState().authData()
const useLogout = () => {
  const router = useRouter()

  return () => {
    useStore.getState().clearAuthData()
    router.push(pages.D._.login.path)
  }
}
const useStoreAuthData = () => useStore(state => state.storeAuthData)

const useAuthorize = () => {
  const path = 'http://localhost:8000/api/token/'
  return postService<I_AuthorizeRequestData, I_AuthorizeResponseData>(path, axiosPost)()
}

export { useIsAuthorized, useAuthData, useAuthorize, useStoreAuthData, useLogout }
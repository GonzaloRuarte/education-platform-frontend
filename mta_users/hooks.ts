import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_AdminProfileCreateRequestData,
  I_AdminProfileUpdateRequestData,
  I_UserChangePasswordRequest,
  I_UserDetail,
  T_UserId,
  T_UserListWithProfiles,
} from '@/mta_users/types'
import pages, { userChangePasswordPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  dynamicNavigationHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { useStore } from '@/shared/state'
import { T_EmptyPayload } from '@/shared/types'

const USERS_PATH = '/users'
const USERS_CHANGE_PASSWORD_PATH = '/users/{id:number}/change-password/'

const useUserList = listHook<T_UserListWithProfiles>(USERS_PATH, axiosGet, useAuthResources)
const useUserDetail = detailHook<T_UserId, I_UserDetail>(USERS_PATH, axiosGet, useAuthResources)
const useUserBatchDelete = batchDeletionHook<T_UserId>(USERS_PATH, axiosDelete, useAuthResources)
const useUserChangePassword = actionHookV3<
  typeof USERS_CHANGE_PASSWORD_PATH,
  I_UserChangePasswordRequest,
  T_EmptyPayload
>(USERS_CHANGE_PASSWORD_PATH, axiosPost, useAuthResources)

const useAdminProfileList = listHook<T_UserListWithProfiles>(`${USERS_PATH}/admins`, axiosGet, useAuthResources)
const useAdminProfileCreate = creationHook<I_AdminProfileCreateRequestData, I_UserDetail>(
  `${USERS_PATH}/create-admin`,
  axiosPost,
  useAuthResources,
)
const useAdminProfileUpdate = updateHook<T_UserId, I_AdminProfileUpdateRequestData, I_UserDetail>(
  `${USERS_PATH}/update-admin`,
  axiosPatch,
  useAuthResources,
)
const useAdminProfileDelete = deletionHook<T_UserId, T_EmptyPayload>(
  `${USERS_PATH}/delete-admin`,
  axiosDelete,
  useAuthResources,
)

const useNavigateToUserChangePassword = dynamicNavigationHook(userChangePasswordPath)
const useNavigateToUserList = navigationHook(pages.D._.usuarios.path)

const useUserStoreWhoIAmData = () => useStore((state) => state.user_storeWhoIAmData)
const useUserWhoIAmData = () => useStore((state) => state.user_whoIAmData)

const useNavigateToAdminProfileDetail = navigationWithIdHook(pages.D._.usuarios._.admins.path)
const useNavigateToAdminProfileList = navigationHook(pages.D._.usuarios._.admins.path)
const useNavigateToAdminProfileCreate = navigationHook(pages.D._.usuarios._.admins._.agregar.path)
export {
  useAdminProfileCreate,
  useAdminProfileList,
  useAdminProfileUpdate,
  useNavigateToAdminProfileCreate,
  useNavigateToAdminProfileDetail,
  useNavigateToAdminProfileList,
  useNavigateToUserChangePassword,
  useNavigateToUserList,
  useUserBatchDelete,
  useUserChangePassword,
  useUserDetail,
  useUserList,
  useUserStoreWhoIAmData,
  useUserWhoIAmData,
  useAdminProfileDelete,
}

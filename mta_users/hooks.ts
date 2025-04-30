import { useAuthResources } from '@/mta_auth/hooks'
import { I_UserChangePasswordRequest, I_UserDetail, T_UserId, T_UserListWithProfiles } from '@/mta_users/types'
import { userListWithProfiles } from '@/mta_users/utils'
import { userChangePasswordPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { batchDeletionHook, detailHook, dynamicNavigationHook, listHook } from '@/shared/hooks'
import { actionHookV3 } from '@/shared/hooks/dataServices/v3'
import { T_EmptyPayload } from '@/shared/types'

const USERS_PATH = '/users'
const USERS_CHANGE_PASSWORD_PATH = '/users/{id:number}/change-password'

const useUserList = listHook<T_UserListWithProfiles>(USERS_PATH, axiosGet, useAuthResources, {
  dataPostProcessor: userListWithProfiles,
})
const useUserDetail = detailHook<T_UserId, I_UserDetail>(USERS_PATH, axiosGet, useAuthResources)
const useUserBatchDelete = batchDeletionHook<T_UserId>(USERS_PATH, axiosDelete, useAuthResources)
const useUserChangePassword = actionHookV3<
  typeof USERS_CHANGE_PASSWORD_PATH,
  I_UserChangePasswordRequest,
  T_EmptyPayload
>(USERS_CHANGE_PASSWORD_PATH, axiosPost, useAuthResources)

const useNavigateToUserChangePassword = dynamicNavigationHook(userChangePasswordPath)

export { useUserBatchDelete, useUserDetail, useUserList, useUserChangePassword, useNavigateToUserChangePassword }

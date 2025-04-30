import { useAuthResources } from '@/mta_auth/hooks'
import { I_UserDetail, T_UserId, T_UserListWithProfiles } from '@/mta_users/types'
import { userListWithProfiles } from '@/mta_users/utils'
import { axiosDelete, axiosGet } from '@/shared/data/axios'
import { batchDeletionHook, detailHook, listHook } from '@/shared/hooks'

const USERS_PATH = '/users'

export const useUserList = listHook<T_UserListWithProfiles>(USERS_PATH, axiosGet, useAuthResources, {
  dataPostProcessor: userListWithProfiles,
})
export const useUserDetail = detailHook<T_UserId, I_UserDetail>(USERS_PATH, axiosGet, useAuthResources)
export const useUserBatchDelete = batchDeletionHook<T_UserId>(USERS_PATH, axiosDelete, useAuthResources)

// // Hook for creating a new user
// export const useUserCreate = creationHook<I_UserCreateRequestData, I_UserCreateResponse>(
//   USERS_PATH,
//   axiosPost,
//   useAuthResources,
// )

// // Hook for updating an existing user
// export const useUserUpdate = updateHook<T_UserId, I_UserUpdateRequestData, I_UserUpdateResponse>(
//   USERS_PATH,
//   axiosPatch,
//   useAuthResources,
// )

// // Hook for deleting a user
// export const useUserDelete = deletionHook<T_UserId>(USERS_PATH, axiosDelete, useAuthResources)

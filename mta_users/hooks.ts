import { listHook, detailHook, creationHook, updateHook, deletionHook } from '@/shared/hooks'
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from '@/shared/data/axios'
import { I_UserDetail, T_UserId, T_UserList } from '@/mta_users/types'
import { useAuthResources } from '@/mta_auth/hooks'

const USERS_PATH = '/users'

export const useUserList = listHook<T_UserList>(USERS_PATH, axiosGet, useAuthResources)

// Hook for retrieving user details
export const useUserDetail = detailHook<T_UserId, I_UserDetail>(USERS_PATH, axiosGet, useAuthResources)

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

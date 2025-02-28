import { I_FetchOptions } from '@/shared/data/types'

type T_FCwChildren<T_OtherProps = object> = React.FC<{ children: React.ReactNode } & T_OtherProps>

type T_ListServiceHook<T_Response> = () => (options: I_FetchOptions) => Promise<T_Response>
type T_CreateServiceHook<T_RequestData, T_Response> = () => (data: T_RequestData) => Promise<T_Response>
type T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => (id: T_Id, data: T_RequestData) => Promise<T_Response>
type T_DeletionServiceHook<T_Id, T_Response> = () => (id: T_Id) => Promise<T_Response>
type T_BatchDeletionServiceHook<T_Id, T_Response> = () => (ids: Array<T_Id>) => Promise<T_Response>

type T_BatchDeletionCommonRequestData<T_Id = number> = { ids: Array<T_Id> }

interface I_ApiError {
  message: string
  status?: number
  rawError?: any
}

interface I_CreationCommonResponse<T = number> {
  id: T
}

export type {
  T_FCwChildren,
  T_ListServiceHook,
  I_ApiError,
  T_CreateServiceHook,
  I_CreationCommonResponse,
  T_UpdateServiceHook,
  T_DeletionServiceHook,
  T_BatchDeletionServiceHook,
  T_BatchDeletionCommonRequestData,
}

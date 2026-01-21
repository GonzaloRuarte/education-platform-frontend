import { I_UseConfirm } from '@/shared/confirm'
import { I_FetchOptions } from '@/shared/data/types'
import { EntityName } from '@/shared/utils'

type T_VoidFn = () => void

type T_FCwChildren<T_OtherProps = object> = React.FC<{ children: React.ReactNode } & T_OtherProps>

interface I_FetchingDataHookResources<T_Data> {
  data: T_Data | undefined
  reload: T_VoidFn
  isLoading: boolean
}
interface I_ActionHookResources<T_RequestData, T_ResponseData> {
  isInProgress: boolean
  executeAction: (data?: T_RequestData) => Promise<T_ResponseData>
}

type T_ListServiceHook<T_Response> = (options?: I_FetchOptions) => I_FetchingDataHookResources<T_Response>
type T_CreateServiceHook<T_RequestData, T_Response> = () => (data: T_RequestData) => Promise<T_Response>
type T_ActionServiceHook<T_RequestData, T_Response> = () => (data?: T_RequestData) => Promise<T_Response>
type T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => (id: T_Id, data: T_RequestData) => Promise<T_Response>
type T_DetailServiceHook<T_Id, T_Response> = (id: T_Id) => I_FetchingDataHookResources<T_Response>
type T_DeletionServiceHook<T_Id, T_Response> = () => (id: T_Id) => Promise<T_Response>
// type T_BatchDeletionServiceHook<T_Id, T_Response> = () => (ids: Array<T_Id>) => Promise<T_Response>
type T_BatchDeletionServiceHook<T_Id> = (d: {
  entityName: EntityName
  showConfirm: I_UseConfirm['showConfirm']
  reload: T_VoidFn
}) => (ids: Array<T_Id>) => void

type T_BatchDeletionCommonRequestData<T_Id = number> = { ids: Array<T_Id> }
type T_NavigateToListHook = () => T_VoidFn
interface I_ApiError {
  message: string
  status?: number
  rawError?: any
}

interface I_CreationCommonResponse<T = number> {
  id: T
}
interface I_DeletionCommonResponse {}

type T_ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never

type T_InProgressHook = () => {
  isInProgress: boolean
  setInProgressStatus: (status: boolean) => void
  setIsNotInProgress: () => void
  setIsInProgress: () => void
}
type T_EmptyPayload = {}

export type {
  I_ApiError,
  I_CreationCommonResponse,
  I_DeletionCommonResponse,
  T_ArrayElement,
  T_BatchDeletionCommonRequestData,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHook,
  T_FCwChildren,
  T_InProgressHook,
  T_ListServiceHook,
  T_NavigateToListHook,
  T_UpdateServiceHook,
  T_ActionServiceHook,
  T_VoidFn,
  T_EmptyPayload,
  I_FetchingDataHookResources,
  I_ActionHookResources,
}

import { I_FetchOptions } from '@/shared/service'

type T_FCwChildren<T_OtherProps = object> = React.FC<{ children: React.ReactNode } & T_OtherProps>

type T_ServiceHook<T_Response> = () => (options: I_FetchOptions) => Promise<T_Response>

export type {
  T_FCwChildren,
  T_ServiceHook,
}
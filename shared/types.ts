import { I_FetchOptions } from '@/shared/data/types'


type T_FCwChildren<T_OtherProps = object> = React.FC<{ children: React.ReactNode } & T_OtherProps>

type T_ServiceHook<T_Response> = () => (options: I_FetchOptions) => Promise<T_Response>

interface I_ApiError {
  message: string;
  status?: number;
  rawError?: any;
}

export type {
  T_FCwChildren,
  T_ServiceHook,
  I_ApiError
}
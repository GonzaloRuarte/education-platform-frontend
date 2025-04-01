import { ErrorCode } from '@/config'
import { I_ApiError } from '@/shared/types'

class ApiError<T_RawError extends Error> extends Error implements I_ApiError {
  status: number
  rawError: T_RawError

  constructor(a: { message: string; status: number; rawError: any }) {
    super(a.message)
    this.name = 'ApiError'
    this.status = a.status
    this.rawError = a.rawError
  }

  public static errorCode(error): ErrorCode {
    return error.rawError.response.data.error_code
  }
  public static message(error): string {
    return error.rawError.response.data.message
  }
}

export default ApiError

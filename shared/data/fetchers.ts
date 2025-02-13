import { I_FetchOptions, I_SessionSetup, T_GetMethod } from '@/shared/data/types'
import axios from 'axios'

const axiosGet: T_GetMethod = async <T_Response>(args: { endpoint: string, sessionSetup?: I_SessionSetup, options: I_FetchOptions }) => {
  return axios.get<T_Response>(args.endpoint, {
    params: args.options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: (
        args.sessionSetup?.accessToken !== undefined
          ? `Bearer ${args.sessionSetup?.accessToken}`
          : undefined
      ),
    }
  }).then(response => {
    return response.data
  })
}

export {
  axiosGet
}
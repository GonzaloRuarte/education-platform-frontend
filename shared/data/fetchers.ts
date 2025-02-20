import { I_FetchOptions, I_RequestSetup, T_GetMethod } from '@/shared/data/types'
import axios from 'axios'

const _axiosBaseHeaders = (requestSetup?: I_RequestSetup) => ({
  'Content-Type': 'application/json',
  ...(requestSetup?.accessToken && { Authorization: `Bearer ${requestSetup?.accessToken}` })
  ,
})

const axiosGet = async <T_Response>(args: { endpoint: string, requestSetup?: I_RequestSetup, options: I_FetchOptions }) => {
  return axios.get<T_Response>(args.endpoint, {
    params: args.options,
    headers: {
      ..._axiosBaseHeaders(args.requestSetup)
    }
  }).then(response => {
    return response.data
  })
}

const axiosPost = async <T_RequestData, T_Response>(args: { endpoint: string, requestSetup?: I_RequestSetup, options: I_FetchOptions, data: T_RequestData }) => {
  return axios.post<T_Response>(args.endpoint, args.data, {
    headers: {
      ..._axiosBaseHeaders(args.requestSetup)
    }
  }).then(response => {
    return response.data
  })
}


const fetchBasedGet: T_GetMethod = async <T_Response>({ endpoint, requestSetup, options }) => {
  const url = new URL(endpoint);

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(requestSetup?.accessToken && { Authorization: `Bearer ${requestSetup.accessToken}` }),
      ...requestSetup?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T_Response>;
};


export {
  axiosGet,
  axiosPost,
  fetchBasedGet
}


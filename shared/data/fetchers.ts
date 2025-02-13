import { I_FetchOptions, I_SessionSetup, T_GetMethod } from '@/shared/data/types'
import axios from 'axios'

const axiosGet: T_GetMethod = async <T_Response>(args: { endpoint: string, sessionSetup?: I_SessionSetup, options: I_FetchOptions }) => {
  return axios.get<T_Response>(args.endpoint, {
    params: args.options,
    headers: {
      'Content-Type': 'application/json',
      ...(args.sessionSetup?.accessToken && { Authorization: `Bearer ${args.sessionSetup?.accessToken}` })
      ,
    }
  }).then(response => {
    return response.data
  })
}

const fetchBasedGet: T_GetMethod = async <T_Response>({ endpoint, sessionSetup, options }) => {
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
      ...(sessionSetup?.accessToken && { Authorization: `Bearer ${sessionSetup.accessToken}` }),
      ...sessionSetup?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T_Response>;
};

export {
  axiosGet,
  fetchBasedGet
}

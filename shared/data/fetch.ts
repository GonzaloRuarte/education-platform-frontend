import { SERVER_ERROR } from '@/shared/data/constants'
import ApiError from '@/shared/data/errors'
import { I_RequestSetup, T_GetMethod, T_PostMethod } from '@/shared/data/types'




const _handledFetchBasedError = async (response: Response) => {
  const errorData = await response.json()
  throw new ApiError({
    message: errorData.detail || SERVER_ERROR,
    status: response.status,
    rawError: errorData
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
    await _handledFetchBasedError(response)
  }

  return response.json() as Promise<T_Response>;
}

const fetchBasedPost: T_PostMethod = async <T_RequestData, T_Response>({ endpoint, requestSetup, data }: { endpoint: string, requestSetup: I_RequestSetup, data: T_RequestData }) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(requestSetup?.accessToken && { Authorization: `Bearer ${requestSetup.accessToken}` }),
      ...requestSetup?.headers,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    await _handledFetchBasedError(response)
  }

  return response.json() as Promise<T_Response>
}


export {
  fetchBasedGet,
  fetchBasedPost
}


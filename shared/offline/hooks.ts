'use client'

import { useNetworkState } from '@uidotdev/usehooks'

const useNetworkStatus = () => {
  const { online } = useNetworkState()
  return { isOnline: online }
}

export { useNetworkStatus }

import { useHasCapabilities } from '@/mta_auth/hooks'
import { T_UserCapability } from '@/mta_auth/types'
import React, { FC } from 'react'

const RestrictedContent: FC<{
  allowedCapabilities?: Array<T_UserCapability>
  children: React.ReactNode
}> = ({ allowedCapabilities, children }) => {
  const hasCapabilities = useHasCapabilities(allowedCapabilities)

  if (!hasCapabilities) {
    return <></>
  }
  return <>{children}</>
}

export { RestrictedContent as default, RestrictedContent as RRCC }

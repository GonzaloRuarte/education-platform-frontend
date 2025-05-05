import { useUserProfiles } from '@/mta_auth/hooks'
import { T_UserProfiles } from '@/mta_users/types'
import React, { FC } from 'react'

const RestrictedContent: FC<{ allowedProfiles: Array<T_UserProfiles>; children: React.ReactNode }> = ({
  allowedProfiles,
  children,
}) => {
  const profiles = useUserProfiles()
  const isAuthorized = profiles?.some((profile) => allowedProfiles.includes(profile))
  if (!isAuthorized) {
    return <></>
  }
  return <>{children}</>
}

export { RestrictedContent as default, RestrictedContent as RRCC }

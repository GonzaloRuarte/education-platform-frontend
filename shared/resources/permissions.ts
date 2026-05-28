import { T_UserCapability } from '@/mta_auth/types'

import { I_ResourceDefinition, I_ResourceField, T_ResourceCrudAction } from './types'

const resourceAllowsAction = (
  resource: I_ResourceDefinition | undefined,
  action: T_ResourceCrudAction,
) => Boolean(resource?.business_actions.includes(action))

const resourceActionCapabilities = (
  resource: I_ResourceDefinition | undefined,
  action: T_ResourceCrudAction,
): Array<T_UserCapability> | undefined => {
  const capability = resource?.capabilities[action]

  return capability ? [capability as T_UserCapability] : undefined
}

const hasCapability = (
  userCapabilities: Array<T_UserCapability> | undefined,
  capability: string | null | undefined,
) => {
  if (!capability) return true
  return userCapabilities?.includes(capability as T_UserCapability) ?? false
}

const resourceFieldIsVisible = (
  field: I_ResourceField,
  userCapabilities: Array<T_UserCapability> | undefined,
) => hasCapability(userCapabilities, field.visible_capability)

export { resourceActionCapabilities, resourceAllowsAction, resourceFieldIsVisible }

import { T_LogService } from '@/shared/log'
import { T_VoidFn } from '@/shared/types'
import { Component, ComponentType, FC } from 'react'

interface IApplicationServiceBaseProps {}

type T_ApplicationService<TOtherProps = object> = ComponentType<IApplicationServiceBaseProps & TOtherProps>

interface I_ApplicationServiceDependencies {
  stateVersion?: string | undefined
  executeStateResetTasks?: T_VoidFn
  storeStateVersion?: (version: string) => void
  log?: T_LogService
}

export type { I_ApplicationServiceDependencies, IApplicationServiceBaseProps, T_ApplicationService }

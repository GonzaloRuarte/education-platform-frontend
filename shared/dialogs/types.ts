import { T_VoidFn } from '@/shared/types'
import { ReactNode } from 'react'

interface I_DialogAction {
  buttonLabel: string
  onPress: T_VoidFn
  key: string
}
interface I_DialogProps {
  isVisible: boolean
  title: string
  content: ReactNode
  actions: Array<I_DialogAction>
  onClose: T_VoidFn
}
interface I_DialogConfig {
  title: string
  content: ReactNode
  actions: Array<I_DialogAction>
}

interface I_DialogExtendedConfig extends I_DialogConfig {
  isVisible: boolean
}

export type { I_DialogAction, I_DialogProps, I_DialogConfig, I_DialogExtendedConfig }

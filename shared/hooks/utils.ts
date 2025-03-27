import { useState } from 'react'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'
import { useTheme as useMUITheme } from '@mui/material'
import { T_InProgressHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'

const useInProgressLocal: T_InProgressHook = () => {
  const [isInProgress, setInProgressStatus] = useState(false)
  return {
    isInProgress,
    setInProgressStatus,
    setIsNotInProgress: () => setInProgressStatus(false),
    setIsInProgress: () => setInProgressStatus(true),
  }
}
const useInProgress: T_InProgressHook = () => {
  const isInProgress = useStore((state) => state.isInProgress)
  const setInProgressStatus = useStore((state) => state.setIsInProgress)
  return {
    isInProgress,
    setInProgressStatus,
    setIsNotInProgress: () => setInProgressStatus(false),
    setIsInProgress: () => setInProgressStatus(true),
  }
}
const useHandleDelete = (
  id: number | string,
  d: {
    showConfirm: (title: string, content: string) => Promise<void>
    deleteInstance: (id: any) => Promise<any>
    entityName: EntityName
    callback: T_VoidFn
  },
) => {
  return () => {
    d.showConfirm(`Eliminar ${d.entityName.singular} #${id}`, '¿Estás seguro/a que querés proceder?').then(() => {
      d.deleteInstance(id).then(() => {
        successToast(`${d.entityName.singular} eliminada correctamente.`)
        d.callback()
      })
    })
  }
}
const useTheme = useMUITheme

export { useInProgress, useInProgressLocal, useHandleDelete, useTheme }

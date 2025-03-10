import { useState } from 'react'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'
import { useTheme as useMUITheme } from '@mui/material'
import { T_InProgressHook } from '@/shared/types'

const useInProgressLocal: T_InProgressHook = () => {
  const [isInProgress, setIsInProgress] = useState(false)
  return { isInProgress, setIsInProgress }
}
const useInProgress: T_InProgressHook = () => {
  const isInProgress = useStore((state) => state.isInProgress)
  const setIsInProgress = useStore((state) => state.setIsInProgress)
  return { isInProgress, setIsInProgress }
}
const useHandleDelete = (
  id: number | string,
  d: {
    showConfirm: (title: string, content: string) => Promise<void>
    deleteInstance: (id: any) => Promise<any>
    entityName: string
    callback: () => void
  },
) => {
  return () => {
    d.showConfirm(`Eliminar escuela #${id}`, '¿Estás seguro/a que querés eliminar esta Escuela?').then(() => {
      d.deleteInstance(id).then(() => {
        successToast(`${d.entityName} eliminada correctamente.`)
        d.callback()
      })
    })
  }
}
const useTheme = useMUITheme

export { useInProgress, useInProgressLocal, useHandleDelete, useTheme }

import { useState } from 'react'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'

const useInProgressLocal = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}
const useInProgress = () => {
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

export { useInProgress, useInProgressLocal, useHandleDelete }

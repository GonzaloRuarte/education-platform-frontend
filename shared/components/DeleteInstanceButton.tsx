import { DeleteButton } from '@/shared/components/buttons'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { T_DeletionServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'

interface I_Props<T_Id> {
  useDelete: T_DeletionServiceHook<T_Id, any>
  id: T_Id
  callback: T_VoidFn
  entityName: EntityName
}

function DeleteInstanceButton<T_Id extends number | string>({ useDelete, id, callback, entityName }: I_Props<T_Id>) {
  const deleteInstance = useDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const handleDelete = useHandleDelete(id, { showConfirm, deleteInstance, callback, entityName })
  return (
    <>
      <DeleteButton onClick={handleDelete} color="error" />
      <ConfirmDialogComponent />
    </>
  )
}

export default DeleteInstanceButton

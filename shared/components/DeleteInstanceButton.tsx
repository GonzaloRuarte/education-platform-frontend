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
  disabled?: boolean
}

function DeleteInstanceButton<T_Id extends number | string>({
  useDelete,
  id,
  callback,
  entityName,
  disabled = false,
}: I_Props<T_Id>) {
  const deleteInstance = useDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const handleDelete = useHandleDelete(id, { showConfirm, deleteInstance, callback, entityName })
  return (
    <>
      <DeleteButton onClick={handleDelete} color="error" disabled={disabled} />
      <ConfirmDialogComponent />
    </>
  )
}

export default DeleteInstanceButton

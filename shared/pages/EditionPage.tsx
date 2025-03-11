import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { T_DeletionServiceHook, T_DetailServiceHookV2, T_NavigateToListHook } from '@/shared/types'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import { useParams } from 'next/navigation'
import React from 'react'

const DeleteButton = ({ useDelete, id, callback, entityName }) => {
  const deleteInstance = useDelete()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const handleDelete = useHandleDelete(id, { showConfirm, deleteInstance, callback, entityName })
  return (
    <>
      <Button onClick={handleDelete} startIcon={<DeleteIcon />}>
        Eliminar
      </Button>
      <ConfirmDialogComponent />
    </>
  )
}

interface I_Props<T_Id, T_Data> {
  EditionForm: React.ComponentType<{ data: T_Data }>
  entityName: string
  useDetail: T_DetailServiceHookV2<T_Id, T_Data>
  useDelete?: T_DeletionServiceHook<T_Id, any>
  onExit: () => void
  idFieldName?: string
}

export default function EditionPage<T_Id extends string | number, T_Data>({ idFieldName = 'id', ...p }: I_Props<T_Id, T_Data>) {
  const urlParams = useParams()
  const id = urlParams[idFieldName] as T_Id
  const { data } = p.useDetail(id)

  return (
    <>
      <Page>
        <Page.Title>Editar {p.entityName}</Page.Title>
        <Page.Toolbar>
          <Button onClick={p.onExit} startIcon={<ClearIcon />}>
            Cancelar
          </Button>
          {p.useDelete !== undefined && <DeleteButton callback={p.onExit} entityName={p.entityName} useDelete={p.useDelete} id={id} />}
        </Page.Toolbar>
        <Page.Content>{data === undefined ? <Spinner /> : <p.EditionForm data={data} />}</Page.Content>
      </Page>
    </>
  )
}

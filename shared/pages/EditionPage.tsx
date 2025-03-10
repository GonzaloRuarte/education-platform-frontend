import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { useConfirm } from '@/shared/confirm'
import { useHandleDelete } from '@/shared/hooks'
import { T_DeletionServiceHook, T_DetailServiceHook, T_NavigateToListHook } from '@/shared/types'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface I_Props<T_Id, T_Data> {
  EditionForm: React.ComponentType<{ data: T_Data }>
  entityName: string
  useDetail: T_DetailServiceHook<T_Id, T_Data>
  useDelete: T_DeletionServiceHook<T_Id, any>
  useNavigateToList: T_NavigateToListHook
  idFieldName?: string
}

export default function EditionPage<T_Id extends string | number, T_Data>({ idFieldName = 'id', ...p }: I_Props<T_Id, T_Data>) {
  const urlParams = useParams()
  const id = urlParams[idFieldName] as T_Id
  const detail = p.useDetail()
  const deleteInstance = p.useDelete()
  const navigateToList = p.useNavigateToList()
  const [data, setData] = useState<T_Data | undefined>(undefined)

  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const handleDelete = useHandleDelete(id, { showConfirm, deleteInstance, callback: navigateToList, entityName: p.entityName })

  useEffect(() => {
    detail(id).then(setData)
  }, [id])
  return (
    <>
      <Page>
        <Page.Title>Editar {p.entityName}</Page.Title>
        <Page.Toolbar>
          <Button onClick={navigateToList} startIcon={<ClearIcon />}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} startIcon={<DeleteIcon />}>
            Eliminar
          </Button>
        </Page.Toolbar>
        <Page.Content>{data === undefined ? <Spinner /> : <p.EditionForm data={data} />}</Page.Content>
      </Page>
      <ConfirmDialogComponent />
    </>
  )
}

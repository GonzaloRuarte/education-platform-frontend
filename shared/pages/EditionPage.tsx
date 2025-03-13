import { CancelButton, UpdateButton } from '@/shared/components/buttons'
import DeleteInstanceButton from '@/shared/components/DeleteInstanceButton'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { T_DeletionServiceHook, T_DetailServiceHookV2, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
import { useParams } from 'next/navigation'
import React from 'react'

interface I_Props<T_Id, T_Data> {
  EditionForm: React.ComponentType<{ data: T_Data; reload?: T_VoidFn }>
  entityName: EntityName
  useDetail: T_DetailServiceHookV2<T_Id, T_Data>
  useDelete?: T_DeletionServiceHook<T_Id, any>
  onExit: T_VoidFn
  idFieldName?: string
}

export default function EditionPage<T_Id extends string | number, T_Data>({ idFieldName = 'id', ...p }: I_Props<T_Id, T_Data>) {
  const urlParams = useParams()
  const id = urlParams[idFieldName] as T_Id
  const { reload, data } = p.useDetail(id)

  return (
    <>
      <Page>
        <Page.Title>Editar {p.entityName.singular}</Page.Title>
        <Page.Toolbar>
          <CancelButton onClick={p.onExit} />
          <UpdateButton onClick={reload} />
          {p.useDelete !== undefined && <DeleteInstanceButton callback={p.onExit} entityName={p.entityName} useDelete={p.useDelete} id={id} />}
        </Page.Toolbar>
        <Page.Content>{data === undefined ? <Spinner /> : <p.EditionForm {...{ data, reload }} />}</Page.Content>
      </Page>
    </>
  )
}

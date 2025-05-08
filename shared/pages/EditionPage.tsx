import { BackButton, CancelButton, ReloadButton } from '@/shared/components/buttons'
import DeleteInstanceButton from '@/shared/components/DeleteInstanceButton'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { T_DeletionServiceHook, T_DetailServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
import { useParams } from 'next/navigation'
import React from 'react'

interface I_Props<T_Id, T_Data> {
  EditionForm: React.ComponentType<{ data: T_Data; reload?: T_VoidFn }>
  entityName: EntityName
  useDetail: T_DetailServiceHook<T_Id, T_Data>
  useDelete?: T_DeletionServiceHook<T_Id, any>
  onExit: T_VoidFn
  overridedExitOnDelete?: T_VoidFn
  idFieldName?: string
  customButtons?: (data: T_Data) => React.ReactNode
}

export default function EditionPage<T_Id extends string | number, T_Data>({
  idFieldName = 'id',
  ...p
}: I_Props<T_Id, T_Data>) {
  const urlParams = useParams()
  const id = urlParams[idFieldName] as T_Id
  const { reload, data } = p.useDetail(id)

  return (
    <>
      <Page>
        <Page.Title>Editar {p.entityName.singular}</Page.Title>
        <Page.Toolbar>
          <BackButton onClick={p.onExit} />
          <ReloadButton onClick={reload} />
          {p.useDelete !== undefined && (
            <DeleteInstanceButton
              callback={p.overridedExitOnDelete ?? p.onExit}
              entityName={p.entityName}
              useDelete={p.useDelete}
              id={id}
            />
          )}
          {p.customButtons !== undefined && data !== undefined && p.customButtons(data)}
        </Page.Toolbar>
        <Page.Content>{data === undefined ? <Spinner /> : <p.EditionForm {...{ data, reload }} />}</Page.Content>
      </Page>
    </>
  )
}

'use client'

import { useInProgress } from '@/shared/hooks'
import { BackButton, ReloadButton } from '@/shared/components/buttons'
import DeleteInstanceButton from '@/shared/components/DeleteInstanceButton'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { T_DeletionServiceHook, T_DetailServiceHook, T_UpdateServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName, sentence } from '@/shared/utils'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'

import ResourceForm from './ResourceForm'
import { useResourceSchema } from './hooks'
import { T_ResourceRecord } from './types'

interface I_ResourceEditionPageProps<
  T_Id extends number | string,
  T_Data,
  T_RequestData,
  T_Response,
> {
  resourceKey: string
  entityName: EntityName
  useDetail: T_DetailServiceHook<T_Id, T_Data>
  useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response>
  useDelete?: T_DeletionServiceHook<T_Id, any>
  onExit: T_VoidFn
  idFieldName?: string
  renderAfterForm?: (args: { id: T_Id; data: T_Data; reload: T_VoidFn }) => ReactNode
}

export default function ResourceEditionPage<
  T_Id extends number | string,
  T_Data,
  T_RequestData,
  T_Response,
>({
  resourceKey,
  entityName,
  useDetail,
  useUpdate,
  useDelete,
  onExit,
  idFieldName = 'id',
  renderAfterForm,
}: I_ResourceEditionPageProps<T_Id, T_Data, T_RequestData, T_Response>) {
  const urlParams = useParams()
  const id = urlParams[idFieldName] as unknown as T_Id
  const schema = useResourceSchema(resourceKey)
  const detail = useDetail(id)
  const update = useUpdate()
  const { setInProgressStatus } = useInProgress()

  const reload = () => {
    schema.reload()
    detail.reload()
  }

  const handleSubmit = (payload: T_ResourceRecord) => {
    setInProgressStatus(true)
    update(id, payload as T_RequestData)
      .then(() => {
        successToast(sentence(`${entityName.singular} editado correctamente`))
        onExit()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <Page>
      <Page.Title>Editar {entityName.singular}</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={onExit} />
        <ReloadButton onClick={reload} />
        {useDelete !== undefined && (
          <DeleteInstanceButton
            callback={onExit}
            entityName={entityName}
            useDelete={useDelete}
            id={id}
          />
        )}
      </Page.Toolbar>
      <Page.Content>
        {schema.data === undefined || detail.data === undefined ? (
          <Spinner />
        ) : (
          <>
            <ResourceForm
              resource={schema.data}
              mode="update"
              initialData={detail.data as T_ResourceRecord}
              submitLabel="Guardar"
              onSubmit={handleSubmit}
            />
            {renderAfterForm?.({ id, data: detail.data, reload })}
          </>
        )}
      </Page.Content>
    </Page>
  )
}

'use client'

import { useInProgress } from '@/shared/hooks'
import { CancelButton } from '@/shared/components/buttons'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { T_CreateServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName, sentence } from '@/shared/utils'

import ResourceForm from './ResourceForm'
import { useResourceSchema } from './hooks'
import { T_ResourceRecord } from './types'

interface I_ResourceCreationPageProps<T_RequestData, T_Response> {
  resourceKey: string
  entityName: EntityName
  useCreate: T_CreateServiceHook<T_RequestData, T_Response>
  onCancel: T_VoidFn
  onCreated?: T_VoidFn
}

export default function ResourceCreationPage<T_RequestData, T_Response>({
  resourceKey,
  entityName,
  useCreate,
  onCancel,
  onCreated,
}: I_ResourceCreationPageProps<T_RequestData, T_Response>) {
  const schema = useResourceSchema(resourceKey)
  const create = useCreate()
  const { setInProgressStatus } = useInProgress()

  const handleSubmit = (payload: T_ResourceRecord) => {
    const afterCreate = onCreated ?? onCancel

    setInProgressStatus(true)
    create(payload as T_RequestData)
      .then(() => {
        successToast(sentence(`${entityName.singular} agregado correctamente`))
        afterCreate()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }

  return (
    <Page>
      <Page.Title>Agregar {entityName.singular}</Page.Title>
      <Page.Toolbar>
        <CancelButton onClick={onCancel} />
      </Page.Toolbar>
      <Page.Content>
        {schema.data === undefined ? (
          <Spinner />
        ) : (
          <ResourceForm
            resource={schema.data}
            mode="create"
            submitLabel="Agregar"
            onSubmit={handleSubmit}
          />
        )}
      </Page.Content>
    </Page>
  )
}

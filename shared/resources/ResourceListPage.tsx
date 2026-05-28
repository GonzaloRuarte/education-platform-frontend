'use client'

import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import Spinner from '@/shared/components/Spinner'
import { axiosGet } from '@/shared/data/axios'
import { I_PaginatedResponse } from '@/shared/data/types'
import ListPage from '@/shared/pages/ListPage'
import { handleServiceError } from '@/shared/service'
import { T_BatchDeletionServiceHook, T_ListServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
import { GridColDef } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'

import { resourceFieldOptionsPath, useResourceSchema } from './hooks'
import { I_ResourceField, I_ResourceStaticOption } from './types'

interface I_ResourceListPageProps<T_Id, T_Response extends I_PaginatedResponse> {
  resourceKey: string
  useList: T_ListServiceHook<T_Response>
  entityName: EntityName
  onRowClickId?: (id: T_Id) => void
  onCreate?: T_VoidFn
  useBatchDelete?: T_BatchDeletionServiceHook<T_Id>
}

const columnTypeByFieldType: Partial<Record<I_ResourceField['type'], GridColDef['type']>> = {
  integer: 'number',
  decimal: 'number',
  boolean: 'boolean',
  date: 'date',
  datetime: 'dateTime',
}

type T_ResourceOptionLookup = Record<string, string>
type T_ResourceOptionLookups = Record<string, T_ResourceOptionLookup>

interface I_ResourceFieldOptionsResponse {
  options: Array<I_ResourceStaticOption>
}

const relationFieldTypes: Array<I_ResourceField['type']> = ['foreign_key', 'many_to_many']

const useResourceRelationOptionLookups = (
  resourceKey: string,
  fields: Array<I_ResourceField>,
): T_ResourceOptionLookups => {
  const authResources = useAuthResources()
  const [lookups, setLookups] = useState<T_ResourceOptionLookups>({})
  const relationFields = useMemo(
    () => fields.filter((field) => relationFieldTypes.includes(field.type)),
    [fields],
  )
  const relationFieldKey = relationFields.map((field) => field.key).join('|')

  useEffect(() => {
    let isActive = true

    if (!relationFields.length) {
      setLookups({})
      return () => {
        isActive = false
      }
    }

    Promise.all(
      relationFields.map((field) =>
        axiosGet<I_ResourceFieldOptionsResponse>({
          url: apiUrl(resourceFieldOptionsPath(resourceKey, field.key)),
          requestSetup: authResources,
          options: {},
        }).then((response) => [
          field.key,
          Object.fromEntries(response.options.map((option) => [String(option.value), option.label])),
        ] as const),
      ),
    )
      .then((entries) => {
        if (isActive) setLookups(Object.fromEntries(entries))
      })
      .catch(handleServiceError)

    return () => {
      isActive = false
    }
  }, [resourceKey, relationFieldKey, authResources.accessToken, authResources.refreshToken])

  return lookups
}

const formatRelationValue = (
  value: unknown,
  optionLookup: T_ResourceOptionLookup | undefined,
) => {
  if (value === null || value === undefined || value === '') return ''

  if (Array.isArray(value)) {
    return value.map((item) => optionLookup?.[String(item)] ?? String(item)).join(', ')
  }

  return optionLookup?.[String(value)] ?? String(value)
}

const fieldToColumn = (field: I_ResourceField, optionLookup?: T_ResourceOptionLookup): GridColDef => {
  const baseColumn: GridColDef = {
    field: field.key,
    headerName: field.label,
    flex: 1,
    sortable: field.sortable,
    filterable: field.filterable,
  }

  if (relationFieldTypes.includes(field.type)) {
    return {
      ...baseColumn,
      type: field.type === 'foreign_key' && optionLookup ? 'singleSelect' : undefined,
      valueOptions: optionLookup
        ? Object.entries(optionLookup).map(([value, label]) => ({ value, label }))
        : undefined,
      getOptionValue: (option: any) => option.value,
      getOptionLabel: (option: any) => option.label,
      renderCell: (params) => formatRelationValue(params.value, optionLookup),
    }
  }

  if (field.type === 'enum' && field.option_source?.kind === 'static') {
    return {
      ...baseColumn,
      type: 'singleSelect',
      valueOptions: field.option_source.options ?? [],
      getOptionValue: (option: any) => option.value,
      getOptionLabel: (option: any) => option.label,
    }
  }

  return {
    ...baseColumn,
    type: columnTypeByFieldType[field.type],
  }
}

export default function ResourceListPage<T_Id extends number | string, T_Response extends I_PaginatedResponse>({
  resourceKey,
  useList,
  entityName,
  onRowClickId,
  onCreate,
  useBatchDelete,
}: I_ResourceListPageProps<T_Id, T_Response>) {
  const schema = useResourceSchema(resourceKey)
  const visibleFields = useMemo(
    () => schema.data?.fields.filter((field) => field.visible_in_list) ?? [],
    [schema.data],
  )
  const relationOptionLookups = useResourceRelationOptionLookups(resourceKey, visibleFields)
  const columns = useMemo(
    () => visibleFields.map((field) => fieldToColumn(field, relationOptionLookups[field.key])),
    [visibleFields, relationOptionLookups],
  )

  if (schema.data === undefined) return <Spinner />

  return (
    <ListPage<T_Id, T_Response>
      columns={columns}
      useList={useList}
      entityName={entityName}
      onRowClick={onRowClickId ? (params) => onRowClickId(params.id as T_Id) : undefined}
      onCreate={onCreate}
      useBatchDelete={useBatchDelete}
      initialPageSize={schema.data.page_size as any}
      stateKey={`resource:${schema.data.key}`}
    />
  )
}

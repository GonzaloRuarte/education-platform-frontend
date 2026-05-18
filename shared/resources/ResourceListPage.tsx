'use client'

import Spinner from '@/shared/components/Spinner'
import { I_PaginatedResponse } from '@/shared/data/types'
import ListPage from '@/shared/pages/ListPage'
import { T_BatchDeletionServiceHook, T_ListServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
import { GridColDef } from '@mui/x-data-grid'
import { useMemo } from 'react'

import { useResourceSchema } from './hooks'
import { I_ResourceField } from './types'

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

const fieldToColumn = (field: I_ResourceField): GridColDef => {
  const baseColumn: GridColDef = {
    field: field.key,
    headerName: field.label,
    flex: 1,
    sortable: field.sortable,
    filterable: field.filterable,
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
  const columns = useMemo(
    () => schema.data?.fields.filter((field) => field.visible_in_list).map(fieldToColumn) ?? [],
    [schema.data],
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

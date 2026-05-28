type T_ResourceFieldType =
  | 'string'
  | 'text'
  | 'rich_text'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'enum'
  | 'foreign_key'
  | 'many_to_many'
  | 'json'

type T_ResourceOptionSourceKind = 'static' | 'resource'
type T_ResourceRelationKind = 'foreign_key' | 'many_to_many'
type T_ResourceCrudAction = 'list' | 'retrieve' | 'create' | 'update' | 'delete'

interface I_ResourceStaticOption {
  value: string | number
  label: string
}

interface I_ResourceOptionSource {
  kind: T_ResourceOptionSourceKind
  options?: Array<I_ResourceStaticOption>
  resource_key?: string
  value_field?: string
  label_field?: string
  depends_on?: Array<string>
}

interface I_ResourceRelation {
  kind: T_ResourceRelationKind
  resource_key: string
  value_field: string
  label_field: string
  depends_on: Array<string>
}

interface I_ResourceField {
  key: string
  label: string
  type: T_ResourceFieldType
  required: boolean
  nullable: boolean
  editable: boolean
  readonly_on_update: boolean
  visible_in_list: boolean
  searchable: boolean
  sortable: boolean
  filterable: boolean
  pii: boolean
  visible_capability?: string | null
  help_text?: string
  option_source?: I_ResourceOptionSource
  relation?: I_ResourceRelation
}

interface I_ResourceDefinition {
  key: string
  label: string
  plural_label: string
  primary_key_fields: Array<string>
  fields: Array<I_ResourceField>
  capabilities: Record<string, string>
  business_actions: Array<T_ResourceCrudAction>
  default_sort: Array<string>
  page_size: number
}

type T_ResourceRecord = Record<string, any>

export type {
  I_ResourceDefinition,
  I_ResourceField,
  I_ResourceOptionSource,
  I_ResourceRelation,
  I_ResourceStaticOption,
  T_ResourceCrudAction,
  T_ResourceFieldType,
  T_ResourceOptionSourceKind,
  T_ResourceRecord,
  T_ResourceRelationKind,
}

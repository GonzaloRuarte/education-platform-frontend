'use client'

import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import SelectControlled from '@/shared/forms/SelectControlled'
import ToggleControlled from '@/shared/forms/ToggleControlled'
import { rules } from '@/shared/forms/messages'
import { SubmitHandler, useForm } from 'react-hook-form'

import { I_ResourceDefinition, I_ResourceField, T_ResourceRecord } from './types'

type T_ResourceFormMode = 'create' | 'update'

interface I_ResourceFormProps {
  resource: I_ResourceDefinition
  mode: T_ResourceFormMode
  initialData?: T_ResourceRecord
  submitLabel: string
  onSubmit: (payload: T_ResourceRecord) => void
}

const isEditableForMode = (field: I_ResourceField, mode: T_ResourceFormMode) =>
  field.editable && (mode === 'create' || !field.readonly_on_update)

const isRenderedFormField = (field: I_ResourceField, mode: T_ResourceFormMode) =>
  isEditableForMode(field, mode) && !['foreign_key', 'many_to_many', 'json'].includes(field.type)

const defaultValueForField = (field: I_ResourceField) => {
  if (field.type === 'boolean') return false
  return ''
}

const buildDefaultValues = (
  fields: Array<I_ResourceField>,
  initialData: T_ResourceRecord | undefined,
) =>
  Object.fromEntries(
    fields.map((field) => [
      field.key,
      initialData?.[field.key] ?? defaultValueForField(field),
    ]),
  )

const normalizeFieldValue = (field: I_ResourceField, value: any) => {
  if (value === '' && field.nullable) return null

  if (field.type === 'integer') {
    return value === '' || value === null || value === undefined ? null : Number.parseInt(String(value), 10)
  }

  if (field.type === 'decimal') {
    return value === '' || value === null || value === undefined ? null : Number(value)
  }

  if (field.type === 'boolean') return Boolean(value)

  return value
}

const normalizePayload = (fields: Array<I_ResourceField>, values: T_ResourceRecord) =>
  Object.fromEntries(fields.map((field) => [field.key, normalizeFieldValue(field, values[field.key])]))

const inputTypeForField = (field: I_ResourceField) => {
  if (field.type === 'email') return 'email'
  if (field.type === 'integer' || field.type === 'decimal') return 'number'
  if (field.type === 'date') return 'date'
  if (field.type === 'datetime') return 'datetime-local'
  return 'text'
}

function ResourceFieldControl({
  field,
  control,
}: {
  field: I_ResourceField
  control: any
}) {
  const validationRules = field.required ? rules.required() : undefined

  if (field.type === 'boolean') {
    return (
      <ToggleControlled
        control={control}
        name={field.key as any}
        label={field.label}
        rules={validationRules}
        helperText={field.help_text}
      />
    )
  }

  if (field.type === 'enum' && field.option_source?.kind === 'static') {
    return (
      <SelectControlled
        control={control}
        name={field.key as any}
        label={field.label}
        rules={validationRules}
        options={field.option_source.options ?? []}
      />
    )
  }

  return (
    <InputControlled
      control={control}
      name={field.key as any}
      label={field.label}
      type={inputTypeForField(field)}
      rules={validationRules}
      helperText={field.help_text}
      multiline={field.type === 'text' || field.type === 'rich_text'}
      minRows={field.type === 'text' || field.type === 'rich_text' ? 3 : undefined}
      InputLabelProps={field.type === 'date' || field.type === 'datetime' ? { shrink: true } : undefined}
    />
  )
}

export default function ResourceForm({
  resource,
  mode,
  initialData,
  submitLabel,
  onSubmit,
}: I_ResourceFormProps) {
  const fields = resource.fields.filter((field) => isRenderedFormField(field, mode))
  const { handleSubmit, control } = useForm<T_ResourceRecord>({
    defaultValues: buildDefaultValues(fields, initialData),
  })

  const submit: SubmitHandler<T_ResourceRecord> = (values) => {
    onSubmit(normalizePayload(fields, values))
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {fields.map((field) => (
        <div key={field.key}>
          <ResourceFieldControl field={field} control={control} />
          <Spacer />
        </div>
      ))}
      <Submit>{submitLabel}</Submit>
    </form>
  )
}

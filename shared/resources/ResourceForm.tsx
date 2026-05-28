'use client'

import { useUserCapabilities } from '@/mta_auth/hooks'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import SelectControlled from '@/shared/forms/SelectControlled'
import ToggleControlled from '@/shared/forms/ToggleControlled'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { rules } from '@/shared/forms/messages'
import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select as MUISelect,
} from '@mui/material'
import { SubmitHandler, useController, useForm } from 'react-hook-form'

import { I_ResourceDefinition, I_ResourceField, T_ResourceRecord } from './types'
import { useResourceFieldOptions } from './hooks'
import { resourceFieldIsVisible } from './permissions'

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
  isEditableForMode(field, mode) && field.type !== 'json'

const defaultValueForField = (field: I_ResourceField) => {
  if (field.type === 'boolean') return false
  if (field.type === 'many_to_many') return []
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
  if (field.type === 'many_to_many') return Array.isArray(value) ? value : []
  if (field.type === 'foreign_key') return value === '' ? null : value

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
  resourceKey,
  field,
  control,
}: {
  resourceKey: string
  field: I_ResourceField
  control: any
}) {
  const validationRules = field.required ? rules.required() : undefined

  if (field.type === 'foreign_key' || field.type === 'many_to_many') {
    return (
      <ResourceRelationFieldControl
        resourceKey={resourceKey}
        field={field}
        control={control}
        rules={validationRules}
      />
    )
  }

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

  if (field.type === 'rich_text') {
    return (
      <WysiwygEditorControlled
        control={control}
        name={field.key as any}
        label={field.label}
        rules={validationRules}
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
      multiline={field.type === 'text'}
      minRows={field.type === 'text' ? 3 : undefined}
      InputLabelProps={field.type === 'date' || field.type === 'datetime' ? { shrink: true } : undefined}
    />
  )
}

function ResourceRelationFieldControl({
  resourceKey,
  field,
  control,
  rules: validationRules,
}: {
  resourceKey: string
  field: I_ResourceField
  control: any
  rules: any
}) {
  const options = useResourceFieldOptions(resourceKey, field.key)
  const { field: controllerField, fieldState } = useController({
    control,
    name: field.key as any,
    rules: validationRules,
  })
  const hasError = fieldState.error !== undefined
  const multiple = field.type === 'many_to_many'
  const value = multiple
    ? Array.isArray(controllerField.value) ? controllerField.value : []
    : controllerField.value ?? ''

  const selectedLabels = (selected: unknown) => {
    const selectedValues = Array.isArray(selected) ? selected : []
    return selectedValues
      .map((selectedValue) => options.data.find((option) => option.value === selectedValue)?.label)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <FormControl fullWidth error={hasError} disabled={options.isLoading}>
      <InputLabel>{field.label}</InputLabel>
      <MUISelect
        multiple={multiple}
        label={field.label}
        value={value}
        onChange={(event) => controllerField.onChange(event.target.value)}
        renderValue={multiple ? selectedLabels : undefined}
      >
        {!multiple && field.nullable && <MenuItem value="">Sin valor</MenuItem>}
        {options.data.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && <Checkbox checked={(value as Array<string | number>).includes(option.value)} />}
            {multiple ? <ListItemText primary={option.label} /> : option.label}
          </MenuItem>
        ))}
      </MUISelect>
      {(hasError || field.help_text) && (
        <FormHelperText>{fieldState.error?.message ?? field.help_text}</FormHelperText>
      )}
    </FormControl>
  )
}

export default function ResourceForm({
  resource,
  mode,
  initialData,
  submitLabel,
  onSubmit,
}: I_ResourceFormProps) {
  const userCapabilities = useUserCapabilities()
  const fields = resource.fields.filter(
    (field) => isRenderedFormField(field, mode) && resourceFieldIsVisible(field, userCapabilities),
  )
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
          <ResourceFieldControl resourceKey={resource.key} field={field} control={control} />
          <Spacer />
        </div>
      ))}
      <Submit>{submitLabel}</Submit>
    </form>
  )
}

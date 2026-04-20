import React, { useEffect, useMemo, useState } from 'react'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { useEvaluationList } from '@/mta_evaluations/hooks'
import { EvaluationStatus } from '@/mta_evaluations/types'
import { SchoolGrade } from '@/mta_schools/constants'

interface I_EvaluationOption {
  id: string
  title: string
}

export const EvaluationSelect: React.FC<{
  value: I_EvaluationOption | null
  onChange: (value: I_EvaluationOption | null) => void
  label?: string
  placeholder?: string
  error?: boolean
  helperText?: string
  filterTitle?: string
  onlyPublished?: boolean
  subject_id?: string
  grade?: SchoolGrade
}> = ({
  value,
  onChange,
  label = 'Evaluación',
  placeholder = 'Seleccionar evaluación',
  error,
  helperText,
  filterTitle,
  onlyPublished = false,
  subject_id,
  grade,
}) => {
    const [options, setOptions] = useState<I_EvaluationOption[]>([])

    const extFilters = useMemo(
      () => ({
        ...(onlyPublished && { status: EvaluationStatus.Published }),
        ...(filterTitle && { title__contains: filterTitle }),
        ...(subject_id && { subject_id }),
        ...(grade && { grade }),
      }),
      [filterTitle, onlyPublished, subject_id, grade],
    )

    const { data, isLoading } = useEvaluationList({
      page_size: 0,
      externalFilters: extFilters,
    })

    useEffect(() => {
      if (data) {
        setOptions(
          data.results.map((e) => ({
            id: String(e.id),
            title: `${e.title} (${e.code})`,
          })),
        )
      } else {
        setOptions([])
      }
    }, [data])

    return (
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.title}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        loading={isLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    )
  }

export const EvaluationSelectControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  placeholder,
  filterTitle,
  onlyPublished = false,
  subject_id,
  grade,
}: UseControllerProps<T_FormFields> & {
  label?: string
  placeholder?: string
  filterTitle?: string
  onlyPublished?: boolean
  subject_id?: string
  grade?: SchoolGrade
}) => {
  const { field, fieldState } = useController({
    name,
    rules,
    shouldUnregister,
    defaultValue,
    control,
  })

  const hasError = fieldState.error !== undefined

  return (
    <EvaluationSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      placeholder={placeholder}
      error={hasError}
      helperText={fieldState.error?.message}
      filterTitle={filterTitle}
      onlyPublished={onlyPublished}
      subject_id={subject_id}
      grade={grade}
    />
  )
}

export type { I_EvaluationOption }
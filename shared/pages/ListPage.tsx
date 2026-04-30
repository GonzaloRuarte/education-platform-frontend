'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import type {
  GridColDef,
  GridFilterItem,
  GridFilterModel,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSingleSelectColDef,
  GridSortDirection,
  GridSortModel,
} from '@mui/x-data-grid'
import { GridLogicOperator } from '@mui/x-data-grid'
import {
  Box,
  Chip,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Table from '@/shared/components/Table'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_BatchDeletionServiceHook, T_ListServiceHook, T_VoidFn } from '@/shared/types'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import { useConfirm } from '@/shared/confirm'
import { paginationModelAsFetchPaginationOptions } from '@/shared/pages/utils'
import { EntityName } from '@/shared/utils'
import type { T_PageSizeOptions } from '@/config'
import { usePathname } from 'next/navigation'

// ----------------------------
// Cache types / config
// ----------------------------
type T_ListPageCache = {
  ts: number
  paginationModel: GridPaginationModel
  sortModel: GridSortModel
  filterModel: GridFilterModel
  advancedOpen: boolean
}

const LISTPAGE_TTL_MS = 3 * 60 * 1000

const DEFAULT_FILTER_MODEL: GridFilterModel = {
  items: [],
  logicOperator: GridLogicOperator.And,
  quickFilterValues: [],
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const HHMM_RE = /^\d{2}:\d{2}$/

// ----------------------------
// Props
// ----------------------------
interface I_Props<
  T_Id,
  T_Response extends I_PaginatedResponse,
  T_Filters extends Record<string, any> = Record<string, any>,
> {
  columns: Array<GridColDef>
  useList: T_ListServiceHook<T_Response>
  entityName: EntityName
  onRowClick?: (params: GridRowParams) => void
  onCreate?: T_VoidFn
  useBatchDelete?: T_BatchDeletionServiceHook<T_Id>
  customButtons?:
  | React.ReactNode
  | ((args: {
    requestFilters: GridFilterModel
    requestSort: GridSortModel
    reload: T_VoidFn
  }) => React.ReactNode)
  filtersComponents?: React.ReactNode
  filtersData?: T_Filters
  singleSelectionButtons?: (id: T_Id) => React.ReactNode
  initialPageSize?: T_PageSizeOptions
  stateKey?: string
}

// ----------------------------
// Helpers
// ----------------------------
type T_FilterOperatorOption = {
  value: string
  label: string
  needsValue?: boolean
}

type T_FilterKind =
  | 'text'
  | 'number'
  | 'boolean'
  | 'singleSelect'
  | 'date'
  | 'time'

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

function hasFilterOperatorPrefix(column: GridColDef | undefined, prefix: string) {
  return (column?.filterOperators ?? []).some((op) => String(op.value).startsWith(prefix))
}

function getSortableColumns(columns: GridColDef[]) {
  return columns.filter((c) => !!c.field && c.sortable !== false)
}

function getFilterableColumns(columns: GridColDef[]) {
  return columns.filter((c) => !!c.field && c.filterable !== false)
}

function getColumnLabel(column: GridColDef) {
  return column.headerName || column.field
}

function getNextUnusedSortField(columns: GridColDef[], current: GridSortModel) {
  const used = new Set(current.map((item) => item.field).filter(Boolean))
  return columns.find((col) => !used.has(col.field))?.field ?? columns[0]?.field ?? ''
}

function getColumnFilterKind(column?: GridColDef): T_FilterKind {
  if (!column) return 'text'

  if (hasFilterOperatorPrefix(column, 'date')) return 'date'
  if (hasFilterOperatorPrefix(column, 'time')) return 'time'

  switch (column.type) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'singleSelect':
      return 'singleSelect'
    case 'date':
    case 'dateTime':
      return 'date'
    default:
      return 'text'
  }
}

function getFilterOperatorOptions(column?: GridColDef): T_FilterOperatorOption[] {
  const kind = getColumnFilterKind(column)

  switch (kind) {
    case 'number':
      return [
        { value: '=', label: 'es igual a' },
        { value: '!=', label: 'es distinto de' },
        { value: '>', label: 'es mayor que' },
        { value: '>=', label: 'es mayor o igual que' },
        { value: '<', label: 'es menor que' },
        { value: '<=', label: 'es menor o igual que' },
        { value: 'isEmpty', label: 'está vacío', needsValue: false },
        { value: 'isNotEmpty', label: 'no está vacío', needsValue: false },
      ]
    case 'boolean':
      return [
        { value: 'is', label: 'es' },
        { value: 'isEmpty', label: 'está vacío', needsValue: false },
        { value: 'isNotEmpty', label: 'no está vacío', needsValue: false },
      ]
    case 'singleSelect':
      return [
        { value: 'is', label: 'es' },
        { value: 'not', label: 'no es' },
        { value: 'isEmpty', label: 'está vacío', needsValue: false },
        { value: 'isNotEmpty', label: 'no está vacío', needsValue: false },
      ]
    case 'date':
      return [
        { value: 'dateEquals', label: 'es' },
        { value: 'dateAfter', label: 'es después de' },
        { value: 'dateOnOrAfter', label: 'es desde' },
        { value: 'dateBefore', label: 'es antes de' },
        { value: 'dateOnOrBefore', label: 'es hasta' },
      ]
    case 'time':
      return [
        { value: 'timeEquals', label: 'es' },
        { value: 'timeAfter', label: 'es después de' },
        { value: 'timeOnOrAfter', label: 'es desde' },
        { value: 'timeBefore', label: 'es antes de' },
        { value: 'timeOnOrBefore', label: 'es hasta' },
      ]
    default:
      return [
        { value: 'contains', label: 'contiene' },
        { value: 'equals', label: 'es igual a' },
        { value: 'startsWith', label: 'empieza con' },
        { value: 'endsWith', label: 'termina con' },
        { value: 'isEmpty', label: 'está vacío', needsValue: false },
        { value: 'isNotEmpty', label: 'no está vacío', needsValue: false },
      ]
  }
}

function getOperatorLabel(column: GridColDef | undefined, operator: string | undefined) {
  if (!column || !operator) return operator ?? ''
  return getFilterOperatorOptions(column).find((op) => op.value === operator)?.label ?? operator
}

function operatorNeedsValue(column: GridColDef | undefined, operator: string | undefined) {
  if (!column || !operator) return true
  const option = getFilterOperatorOptions(column).find((o) => o.value === operator)
  return option?.needsValue !== false
}

function makeDraftFilterItem(columns: GridColDef[]): GridFilterItem {
  const first = getFilterableColumns(columns)[0]
  const firstOperator = getFilterOperatorOptions(first)[0]

  return {
    id: makeId(),
    field: first?.field ?? '',
    operator: firstOperator?.value ?? 'contains',
    value: firstOperator?.needsValue === false ? undefined : '',
  }
}

function normalizeSortModelForFetch(model: GridSortModel): GridSortModel {
  const seen = new Set<string>()
  const result: GridSortModel = []

  for (const item of model) {
    if (!item.field) continue
    if (item.sort !== 'asc' && item.sort !== 'desc') continue
    if (seen.has(item.field)) continue

    seen.add(item.field)
    result.push({ field: item.field, sort: item.sort })
  }

  return result
}

function normalizeFilterValueForFetch(kind: T_FilterKind, rawValue: unknown) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue

  if (value === '' || value === undefined || value === null) return null

  if (kind === 'date') {
    return typeof value === 'string' && ISO_DATE_RE.test(value) ? value : null
  }

  if (kind === 'time') {
    return typeof value === 'string' && HHMM_RE.test(value) ? value : null
  }

  return value
}

function normalizeFilterModelForFetch(
  model: GridFilterModel,
  columns: GridColDef[],
): GridFilterModel {
  const columnsByField = new Map(columns.map((c) => [c.field, c]))

  const items =
    model.items?.flatMap((item, index) => {
      const column = columnsByField.get(item.field)
      if (!column) return []

      const operator = item.operator || getFilterOperatorOptions(column)[0]?.value
      if (!operator) return []

      const kind = getColumnFilterKind(column)
      const needsValue = operatorNeedsValue(column, operator)
      const normalizedValue = normalizeFilterValueForFetch(kind, item.value)

      if (needsValue && normalizedValue === null) {
        return []
      }

      return [
        {
          ...item,
          id: item.id ?? `f-${index}-${makeId()}`,
          operator,
          value: needsValue ? normalizedValue ?? undefined : undefined,
        },
      ]
    }) ?? []

  const quickFilterValues =
    model.quickFilterValues
      ?.map((v) => String(v).trim())
      .filter(Boolean) ?? []

  return {
    ...model,
    items,
    logicOperator: model.logicOperator ?? GridLogicOperator.And,
    quickFilterValues,
  }
}

function readCache(storageKey: string): T_ListPageCache | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null

    const cached = JSON.parse(raw) as T_ListPageCache
    const isFresh =
      typeof cached?.ts === 'number' && Date.now() - cached.ts <= LISTPAGE_TTL_MS

    if (!isFresh) {
      sessionStorage.removeItem(storageKey)
      return null
    }

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ...cached,
        ts: Date.now(),
      } satisfies T_ListPageCache),
    )

    return cached
  } catch {
    sessionStorage.removeItem(storageKey)
    return null
  }
}

function isSingleSelectColumn(
  column?: GridColDef,
): column is GridSingleSelectColDef {
  return column?.type === 'singleSelect'
}

function getSingleSelectOptions(
  column?: GridColDef,
): Array<{ value: string; label: string }> {
  if (!isSingleSelectColumn(column)) return []

  const raw = Array.isArray(column.valueOptions) ? column.valueOptions : []

  return raw.map((option) => {
    if (typeof option === 'object' && option !== null) {
      const value =
        column.getOptionValue?.(option) ??
        ('value' in option ? (option as { value: unknown }).value : option)

      const label =
        column.getOptionLabel?.(option) ??
        ('label' in option
          ? (option as { label: unknown }).label
          : 'value' in option
            ? (option as { value: unknown }).value
            : option)

      return {
        value: String(value),
        label: String(label),
      }
    }

    return {
      value: String(option),
      label: String(option),
    }
  })
}

function getSortDirectionLabel(sort?: GridSortDirection) {
  if (sort === 'desc') return 'descendente'
  if (sort === 'asc') return 'ascendente'
  return 'sin orden'
}

function getSortDirectionLongLabel(sort?: GridSortDirection) {
  if (sort === 'desc') return 'Descendente (Z-A / mayor a menor)'
  if (sort === 'asc') return 'Ascendente (A-Z / menor a mayor)'
  return 'Sin orden'
}

function formatFilterValueForChip(kind: T_FilterKind, value: unknown) {
  if (value === undefined || value === null || String(value).trim() === '') return ''

  if (kind === 'date' && typeof value === 'string' && ISO_DATE_RE.test(value)) {
    return dayjs(value).format('DD/MM/YYYY')
  }

  return String(value)
}

// ----------------------------
// Batch Delete button
// ----------------------------
function BatchDeleteAction<T_Id>(p: {
  useBatchDelete: T_BatchDeletionServiceHook<T_Id>
  entityName: EntityName
  reload: T_VoidFn
  rowSelectionModel: GridRowSelectionModel
}) {
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const { entityName, reload, useBatchDelete, rowSelectionModel } = p
  const showDelete = rowSelectionModel.length > 0
  const batchDelete = useBatchDelete({ entityName, reload, showConfirm })

  const handleBatchDelete = () => {
    const ids = rowSelectionModel as Array<T_Id>
    batchDelete(ids)
  }

  if (!showDelete) return null

  return (
    <>
      <Button onClick={handleBatchDelete} startIcon={<DeleteIcon />} color="error">
        Eliminar
      </Button>
      <ConfirmDialogComponent />
    </>
  )
}

// ----------------------------
// Shared card wrapper
// ----------------------------
function PanelCard(p: {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        minHeight: '100%',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2, minWidth: 0, width: '100%' }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="flex-start"
          sx={{ minWidth: 0, flex: 1 }}
        >
          {p.icon}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1">{p.title}</Typography>
            {p.description && (
              <Typography variant="body2" color="text.secondary">
                {p.description}
              </Typography>
            )}
          </Box>
        </Stack>

        {p.actions && (
          <Box
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: 0,
              maxWidth: '100%',
              flexShrink: 1,
            }}
          >
            {p.actions}
          </Box>
        )}
      </Stack>

      <Box sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>{p.children}</Box>
    </Box>
  )
}

// ----------------------------
// Quick search panel
// ----------------------------
function QuickSearchPanel(p: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}) {
  return (
    <PanelCard
      title="Buscar"
      description="Busca texto en varias columnas de la tabla."
      icon={<SearchIcon fontSize="small" />}
      actions={
        <Button onClick={p.onClear} startIcon={<ClearAllIcon />}>
          Limpiar
        </Button>
      }
    >
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label="Buscar en la tabla"
          value={p.value}
          onChange={(e) => p.onChange(e.target.value)}
          fullWidth
        />

        <Typography variant="caption" color="text.secondary">
          Es útil para una búsqueda rápida sin armar filtros más específicos.
        </Typography>
      </Stack>
    </PanelCard>
  )
}

// ----------------------------
// Advanced sort builder
// ----------------------------
function AdvancedSortBuilder(p: {
  columns: GridColDef[]
  value: GridSortModel
  onChange: (value: GridSortModel) => void
}) {
  const sortableColumns = useMemo(() => getSortableColumns(p.columns), [p.columns])

  if (!sortableColumns.length) return null

  const addRule = () => {
    const nextField = getNextUnusedSortField(sortableColumns, p.value)

    p.onChange([
      ...p.value,
      {
        field: nextField,
        sort: 'asc',
      },
    ])
  }

  const updateRule = (index: number, patch: Partial<GridSortModel[number]>) => {
    const next = [...p.value]
    next[index] = { ...next[index], ...patch }
    p.onChange(next)
  }

  const removeRule = (index: number) => {
    p.onChange(p.value.filter((_, i) => i !== index))
  }

  return (
    <PanelCard
      title="Ordenar"
      description="Se aplica de arriba hacia abajo."
      icon={<SortIcon fontSize="small" />}
      actions={
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{ minWidth: 0, maxWidth: '100%' }}
        >
          <Button onClick={addRule} startIcon={<AddCircleOutlineIcon />}>
            Agregar criterio
          </Button>
          <Button onClick={() => p.onChange([])} startIcon={<ClearAllIcon />}>
            Limpiar
          </Button>
        </Stack>
      }
    >
      <Stack spacing={1.5} sx={{ minWidth: 0, width: '100%' }}>
        {p.value.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No hay criterios de orden.
          </Typography>
        )}

        {p.value.map((item, index) => (
          <Box
            key={`${item.field}-${index}`}
            sx={{
              p: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1.5,
              minWidth: 0,
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Stack spacing={1.25} sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                sx={{ minWidth: 0 }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0 }}>
                  {index === 0 ? 'Primero' : index === 1 ? 'Después' : `Luego ${index + 1}`}
                </Typography>

                <IconButton aria-label="Eliminar criterio" onClick={() => removeRule(index)}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  gap: 1.25,
                  minWidth: 0,
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Ordenar por"
                  value={item.field}
                  onChange={(e) => updateRule(index, { field: e.target.value })}
                  fullWidth
                  sx={{ minWidth: 0 }}
                >
                  {sortableColumns.map((col) => (
                    <MenuItem key={col.field} value={col.field}>
                      {getColumnLabel(col)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Sentido"
                  value={item.sort ?? 'asc'}
                  onChange={(e) => updateRule(index, { sort: e.target.value as 'asc' | 'desc' })}
                  fullWidth
                  sx={{
                    minWidth: 0,
                    '& .MuiSelect-select': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  <MenuItem value="asc">Ascendente</MenuItem>
                  <MenuItem value="desc">Descendente</MenuItem>
                </TextField>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </PanelCard>
  )
}

// ----------------------------
// Advanced filter builder
// ----------------------------
function AdvancedFilterBuilder(p: {
  columns: GridColDef[]
  value: GridFilterModel
  onChange: (value: GridFilterModel) => void
}) {
  const filterableColumns = useMemo(() => getFilterableColumns(p.columns), [p.columns])

  if (!filterableColumns.length) return null

  const addRule = () => {
    p.onChange({
      ...p.value,
      items: [...(p.value.items ?? []), makeDraftFilterItem(filterableColumns)],
    })
  }

  const updateRule = (index: number, patch: Partial<GridFilterItem>) => {
    const nextItems = [...(p.value.items ?? [])]
    nextItems[index] = { ...nextItems[index], ...patch }
    p.onChange({ ...p.value, items: nextItems })
  }

  const removeRule = (index: number) => {
    p.onChange({
      ...p.value,
      items: (p.value.items ?? []).filter((_, i) => i !== index),
    })
  }

  return (
    <PanelCard
      title="Filtrar"
      description="Crea condiciones más específicas para acotar resultados."
      icon={<FilterAltIcon fontSize="small" />}
      actions={
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{ minWidth: 0, maxWidth: '100%' }}
        >
          <Button onClick={addRule} startIcon={<AddCircleOutlineIcon />}>
            Agregar condición
          </Button>
          <Button
            onClick={() =>
              p.onChange({
                ...p.value,
                items: [],
              })
            }
            startIcon={<ClearAllIcon />}
          >
            Limpiar
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
        <FormControl sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Cómo combinar los filtros
          </Typography>

          <RadioGroup
            value={p.value.logicOperator ?? GridLogicOperator.And}
            onChange={(e) =>
              p.onChange({
                ...p.value,
                logicOperator: e.target.value as GridLogicOperator,
              })
            }
          >
            <FormControlLabel
              value={GridLogicOperator.And}
              control={<Radio />}
              label="Cumplir todas las condiciones"
            />
            <FormControlLabel
              value={GridLogicOperator.Or}
              control={<Radio />}
              label="Cumplir al menos una condición"
            />
          </RadioGroup>

          <Typography variant="caption" color="text.secondary">
            “Todas” exige que el registro cumpla cada condición. “Al menos una” permite
            que cumpla cualquiera.
          </Typography>
        </FormControl>

        {(p.value.items ?? []).length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No hay condiciones de filtro.
          </Typography>
        )}

        {(p.value.items ?? []).map((item, index) => {
          const column =
            filterableColumns.find((c) => c.field === item.field) ?? filterableColumns[0]

          const kind = getColumnFilterKind(column)
          const operators = getFilterOperatorOptions(column)
          const selectedOperator =
            operators.find((o) => o.value === item.operator)?.value ??
            operators[0]?.value ??
            'contains'
          const needsValue = operatorNeedsValue(column, selectedOperator)
          const singleSelectOptions = getSingleSelectOptions(column)

          return (
            <Box
              key={String(item.id ?? index)}
              sx={{
                p: 1.5,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1.5,
                minWidth: 0,
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 0 }}
                >
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0 }}>
                    {index === 0 ? 'Si' : index === 1 ? 'Y también' : `Condición ${index + 1}`}
                  </Typography>

                  <IconButton aria-label="Eliminar condición" onClick={() => removeRule(index)}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: 1.25,
                    minWidth: 0,
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Campo"
                    value={item.field || column.field}
                    onChange={(e) => {
                      const nextColumn =
                        filterableColumns.find((c) => c.field === e.target.value) ??
                        filterableColumns[0]
                      const nextOperator = getFilterOperatorOptions(nextColumn)[0]

                      updateRule(index, {
                        field: nextColumn.field,
                        operator: nextOperator?.value,
                        value: nextOperator?.needsValue === false ? undefined : '',
                      })
                    }}
                    fullWidth
                    sx={{ minWidth: 0 }}
                  >
                    {filterableColumns.map((col) => (
                      <MenuItem key={col.field} value={col.field}>
                        {getColumnLabel(col)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Comparación"
                    value={selectedOperator}
                    onChange={(e) => {
                      const nextOperator = e.target.value
                      const nextNeedsValue = operatorNeedsValue(column, nextOperator)

                      updateRule(index, {
                        operator: nextOperator,
                        value: nextNeedsValue ? (item.value ?? '') : undefined,
                      })
                    }}
                    fullWidth
                    sx={{
                      minWidth: 0,
                      '& .MuiSelect-select': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    {operators.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  {needsValue && kind === 'boolean' && (
                    <TextField
                      select
                      size="small"
                      label="Valor"
                      value={String(item.value ?? '')}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      fullWidth
                      sx={{ minWidth: 0 }}
                    >
                      <MenuItem value="true">Sí</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                  )}

                  {needsValue && kind === 'singleSelect' && singleSelectOptions.length > 0 && (
                    <TextField
                      select
                      size="small"
                      label="Valor"
                      value={String(item.value ?? '')}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      fullWidth
                      sx={{ minWidth: 0 }}
                    >
                      {singleSelectOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  {needsValue && kind === 'date' && (
                    <TextField
                      size="small"
                      label="Fecha"
                      type="date"
                      value={typeof item.value === 'string' ? item.value : ''}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      fullWidth
                      sx={{ minWidth: 0 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}

                  {needsValue && kind === 'time' && (
                    <TextField
                      size="small"
                      label="Hora"
                      type="time"
                      value={typeof item.value === 'string' ? item.value : ''}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      fullWidth
                      sx={{ minWidth: 0 }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                    />
                  )}

                  {needsValue &&
                    kind !== 'boolean' &&
                    kind !== 'singleSelect' &&
                    kind !== 'date' &&
                    kind !== 'time' && (
                      <TextField
                        size="small"
                        label="Valor"
                        type={kind === 'number' ? 'number' : 'text'}
                        value={item.value ?? ''}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                        fullWidth
                        sx={{ minWidth: 0 }}
                      />
                    )}
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Stack>
    </PanelCard>
  )
}

// ----------------------------
// Summary chips
// ----------------------------
function SummaryChips(p: {
  columns: GridColDef[]
  quickSearchText: string
  filterModel: GridFilterModel
  sortModel: GridSortModel
  onClearQuickSearch: () => void
  onRemoveFilter: (id: GridFilterItem['id']) => void
  onRemoveSort: (index: number) => void
}) {
  const hasActiveFilters = p.filterModel.items.length > 0
  const logicLabel =
    p.filterModel.logicOperator === GridLogicOperator.Or
      ? 'Cumplir al menos una condición'
      : 'Cumplir todas las condiciones'

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {p.quickSearchText && (
        <Chip
          label={`Buscar: ${p.quickSearchText}`}
          onDelete={p.onClearQuickSearch}
        />
      )}

      {hasActiveFilters && <Chip label={logicLabel} />}

      {p.filterModel.items.map((item) => {
        const column = p.columns.find((c) => c.field === item.field)
        const columnLabel = column ? getColumnLabel(column) : item.field
        const operatorLabel = getOperatorLabel(column, item.operator)
        const kind = getColumnFilterKind(column)
        const formattedValue = formatFilterValueForChip(kind, item.value)
        const valueText = formattedValue ? ` ${formattedValue}` : ''

        return (
          <Chip
            key={String(item.id)}
            label={`${columnLabel} ${operatorLabel}${valueText}`}
            onDelete={() => p.onRemoveFilter(item.id)}
          />
        )
      })}

      {p.sortModel
        .filter((item) => item.sort === 'asc' || item.sort === 'desc')
        .map((item, index) => {
          const column = p.columns.find((c) => c.field === item.field)
          const columnLabel = column ? getColumnLabel(column) : item.field
          const prefix = index === 0 ? 'Orden' : 'Luego'

          return (
            <Chip
              key={`${item.field}-${index}`}
              label={`${prefix}: ${columnLabel} ${getSortDirectionLabel(item.sort)}`}
              onDelete={() => p.onRemoveSort(index)}
            />
          )
        })}
    </Stack>
  )
}

// ----------------------------
// List Page Component
// ----------------------------
function ListPage<
  T_Id,
  T_Response extends I_PaginatedResponse,
  T_Filters extends Record<string, any> = Record<string, any>,
>(p: I_Props<T_Id, T_Response, T_Filters>) {
  const pathname = usePathname()

  const derivedStateKey = (() => {
    if (p.stateKey) return p.stateKey
    try {
      return JSON.stringify(p.filtersData ?? {})
    } catch {
      return 'nofilters'
    }
  })()

  const storageKey = `listpage:${pathname}:${p.entityName.plural}:${derivedStateKey}`

  const initialCacheRef = useRef<T_ListPageCache | null>(null)
  if (initialCacheRef.current === null && typeof window !== 'undefined') {
    initialCacheRef.current = readCache(storageKey)
  }

  const initialCache = initialCacheRef.current

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(
    initialCache?.paginationModel ?? {
      page: 0,
      pageSize: p.initialPageSize ?? 100,
    },
  )
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const [sortModel, setSortModel] = useState<GridSortModel>(initialCache?.sortModel ?? [])
  const [filterModel, setFilterModel] = useState<GridFilterModel>(
    initialCache?.filterModel ?? DEFAULT_FILTER_MODEL,
  )
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(initialCache?.advancedOpen ?? false)

  const lastHydratedStorageKeyRef = useRef(storageKey)

  useEffect(() => {
    if (lastHydratedStorageKeyRef.current === storageKey) return

    const cached = readCache(storageKey)

    setPaginationModel(
      cached?.paginationModel ?? {
        page: 0,
        pageSize: p.initialPageSize ?? 100,
      },
    )
    setSortModel(cached?.sortModel ?? [])
    setFilterModel(cached?.filterModel ?? DEFAULT_FILTER_MODEL)
    setAdvancedOpen(cached?.advancedOpen ?? false)
    setRowSelectionModel([])

    lastHydratedStorageKeyRef.current = storageKey
  }, [storageKey, p.initialPageSize])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const payload: T_ListPageCache = {
      ts: Date.now(),
      paginationModel,
      sortModel,
      filterModel,
      advancedOpen,
    }

    sessionStorage.setItem(storageKey, JSON.stringify(payload))
  }, [storageKey, paginationModel, sortModel, filterModel, advancedOpen])

  const enableRowSelection =
    p.useBatchDelete !== undefined || p.singleSelectionButtons !== undefined

  // Estado visual del panel
  const requestSortModel = useMemo(
    () => normalizeSortModelForFetch(sortModel),
    [sortModel],
  )

  const requestFilterModel = useMemo(
    () => normalizeFilterModelForFetch(filterModel, p.columns),
    [filterModel, p.columns],
  )

  const debouncedRequestFilterModel = useDebouncedValue(requestFilterModel, 300)

  const quickSearchText = filterModel.quickFilterValues?.[0]?.toString() ?? ''

  const resetToFirstPage = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const setQuickSearch = (value: string) => {
    setFilterModel((prev) => ({
      ...prev,
      quickFilterValues: value.trim() ? [value.trim()] : [],
    }))
    resetToFirstPage()
  }

  const clearQuickSearch = () => {
    setQuickSearch('')
  }

  const clearAllAdvancedState = () => {
    setSortModel([])
    setFilterModel(DEFAULT_FILTER_MODEL)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const removeFilterById = (id: GridFilterItem['id']) => {
    setFilterModel((prev) => ({
      ...prev,
      items: (prev.items ?? []).filter((item) => item.id !== id),
    }))
    resetToFirstPage()
  }

  const removeSortByIndex = (index: number) => {
    setSortModel((prev) => prev.filter((_, i) => i !== index))
    resetToFirstPage()
  }

  const { data, isLoading, reload } = p.useList({
    ...paginationModelAsFetchPaginationOptions(paginationModel),
    sort: requestSortModel,
    filters: debouncedRequestFilterModel,
    externalFilters: p.filtersData,
  })

  const activeCount =
    (quickSearchText ? 1 : 0) +
    requestFilterModel.items.length +
    requestSortModel.length

  return (
    <Page>
      <Page.Title>Listado de {p.entityName.plural}</Page.Title>

      <Page.Toolbar>
        {!p.hideRefreshButton && (
          <Button onClick={reload} startIcon={<ReplayIcon />}>
            Actualizar
          </Button>
        )}

        {p.onCreate && (
          <Button onClick={p.onCreate} startIcon={<AddCircleIcon />}>
            Agregar
          </Button>
        )}

        {typeof p.customButtons === 'function' ? p.customButtons({ reload }) : p.customButtons}

        {p.useBatchDelete && rowSelectionModel.length > 0 && (
          <BatchDeleteAction
            reload={reload}
            rowSelectionModel={rowSelectionModel}
            entityName={p.entityName}
            useBatchDelete={p.useBatchDelete}
          />
        )}

        {rowSelectionModel.length === 1 &&
          p.singleSelectionButtons &&
          p.singleSelectionButtons(rowSelectionModel[0] as T_Id)}

        {typeof p.customButtons === 'function'
          ? p.customButtons({
            requestFilters: requestFilterModel,
            requestSort: requestSortModel,
            reload,
          })
          : p.customButtons}
      </Page.Toolbar>

      <Page.Toolbar>
        <Stack spacing={2} sx={{ width: '100%', minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'center' }}
          >
            <Button
              onClick={() => setAdvancedOpen((prev) => !prev)}
              startIcon={<FilterAltIcon />}
            >
              {advancedOpen ? 'Ocultar filtros y orden' : 'Mostrar filtros y orden'}
              {activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>

            <Button onClick={clearAllAdvancedState} startIcon={<ClearAllIcon />}>
              Limpiar tabla
            </Button>
          </Stack>

          {(quickSearchText ||
            requestFilterModel.items.length > 0 ||
            requestSortModel.length > 0) && (
              <SummaryChips
                columns={p.columns}
                quickSearchText={quickSearchText}
                filterModel={requestFilterModel}
                sortModel={requestSortModel}
                onClearQuickSearch={clearQuickSearch}
                onRemoveFilter={removeFilterById}
                onRemoveSort={removeSortByIndex}
              />
            )}

          <Collapse in={advancedOpen}>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.default',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflowX: 'clip',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                  },
                  gap: 2,
                  alignItems: 'start',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                }}
              >
                <QuickSearchPanel
                  value={quickSearchText}
                  onChange={setQuickSearch}
                  onClear={clearQuickSearch}
                />

                <AdvancedSortBuilder
                  columns={p.columns}
                  value={sortModel}
                  onChange={(next) => {
                    setSortModel(next)
                    resetToFirstPage()
                  }}
                />

                <AdvancedFilterBuilder
                  columns={p.columns}
                  value={filterModel}
                  onChange={(next) => {
                    setFilterModel(next)
                    resetToFirstPage()
                  }}
                />
              </Box>

              {p.filtersComponents && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1">Filtros adicionales</Typography>
                    {p.filtersComponents}
                  </Stack>
                </>
              )}
            </Box>
          </Collapse>
        </Stack>
      </Page.Toolbar>

      <Page.Content>
        <Table
          data={data?.results}
          count={data?.count}
          columns={p.columns}
          isLoading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          onRowSelectionModelChange={(model) => setRowSelectionModel(model)}
          rowSelectionModel={rowSelectionModel}
          checkboxSelection={enableRowSelection}
          disableRowSelectionOnClick
          onRowClick={p.onRowClick}
          disableColumnSorting
          disableColumnFilter
          disableColumnMenu
          ignoreDiacritics
        />
      </Page.Content>
    </Page>
  )
}

// Helper to quickly attach navigation behavior
ListPage.mapNavToOnRowClick =
  (nav: (id: number | string) => void) => (params: GridRowParams<any>) =>
    nav(params.id)

export default ListPage
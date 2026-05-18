'use client'

import { Box, Checkbox, Chip, FormControl, ListItemText, MenuItem, Select, Typography } from '@mui/material'
import Button from '@/shared/components/Button'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, LAYOUT_SIZES, BOX_SHADOWS } from '@/mta_reports_v2/constants'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

// Sentinel del item "Todas" en los selects multi. Se usa como value de un
// MenuItem y como marcador del estado "selección que anula a todas las demás".
const ALL_VALUE = '__all__'

type FilterOption = string | { label: string; value: string }
interface SingleFilterDef {
  kind?: 'single'
  label: string
  value: string
  opts: FilterOption[]
  set: (v: string) => void
}
interface MultiFilterDef {
  kind: 'multi'
  label: string
  // `null` representa "Todas" (anula a las selecciones individuales). Los callers
  // no deberían pasar arrays vacíos con la misma semántica — usar `null` para
  // que el sidebar pueda mostrar el chip de "Todas" sin ambigüedad.
  selected: string[] | null
  opts: FilterOption[]
  set: (v: string[] | null) => void
  allLabel?: string
}
type FilterDef = SingleFilterDef | MultiFilterDef

const optLabel = (o: FilterOption) => (typeof o === 'string' ? o : o.label)
const optValue = (o: FilterOption) => (typeof o === 'string' ? o : o.value)

const labelSx = {
  color: C.navy,
  fontSize: F.select,
  fontWeight: W.bold,
  mb: 1,
}
const selectSx = {
  bgcolor: C.white,
  fontSize: F.select,
  borderRadius: 0,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: C.navyAlpha15 },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
  '& .MuiSelect-select': { py: '12px', px: '16px' },
}

function SingleSelectFilter({ def }: { def: SingleFilterDef }) {
  return (
    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
      <Typography sx={labelSx}>{def.label}</Typography>
      <Select value={def.value} label={def.label} onChange={e => def.set(e.target.value)} sx={selectSx}>
        {def.opts.map(o => {
          const v = optValue(o)
          return <MenuItem key={v} value={v} sx={{ fontSize: F.kpiLabel }}>{optLabel(o)}</MenuItem>
        })}
      </Select>
    </FormControl>
  )
}

function MultiSelectFilter({ def }: { def: MultiFilterDef }) {
  const allLabel = def.allLabel ?? 'Todas'
  const isAll = def.selected === null
  const selectedSet = new Set(def.selected ?? [])
  // El value que recibe el Select tiene que listar exactamente lo que está
  // seleccionado para que MUI pueda dibujar los checkboxes. Cuando estamos en
  // "Todas" no marcamos las opciones individuales — sólo el ALL_VALUE.
  const value = isAll ? [ALL_VALUE] : (def.selected ?? [])

  const handleChange = (raw: unknown) => {
    const arr = Array.isArray(raw) ? (raw as string[]) : [raw as string]
    const wasAll = isAll
    const tappedAll = arr.includes(ALL_VALUE)
    if (tappedAll && !wasAll) {
      def.set(null)
      return
    }
    const next = arr.filter(v => v !== ALL_VALUE)
    // Si nos quedamos sin selección, volvemos a "Todas" para evitar el estado
    // vacío (que dejaría todos los charts en 0 sin feedback claro al usuario).
    if (next.length === 0) {
      def.set(null)
      return
    }
    def.set(next)
  }

  return (
    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
      <Typography sx={labelSx}>{def.label}</Typography>
      <Select
        multiple
        value={value}
        onChange={e => handleChange(e.target.value)}
        sx={selectSx}
        renderValue={() => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {isAll
              ? <Chip size="small" label={allLabel} sx={{ fontSize: F.kpiLabel }} />
              : def.opts
                  .filter(o => selectedSet.has(optValue(o)))
                  .map(o => <Chip key={optValue(o)} size="small" label={optLabel(o)} sx={{ fontSize: F.kpiLabel }} />)}
          </Box>
        )}
      >
        <MenuItem value={ALL_VALUE} sx={{ fontSize: F.kpiLabel }}>
          <Checkbox checked={isAll} />
          <ListItemText primary={allLabel} />
        </MenuItem>
        {def.opts.map(o => {
          const v = optValue(o)
          return (
            <MenuItem key={v} value={v} sx={{ fontSize: F.kpiLabel }}>
              <Checkbox checked={!isAll && selectedSet.has(v)} />
              <ListItemText primary={optLabel(o)} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  return (
    <Box sx={{
      width: LAYOUT_SIZES.sidebarWidth,
      minHeight: 0,
      flexShrink: 0,
      bgcolor: C.white,
      px: 4,
      pt: 9,
      pb: 4,
      m: 2,
      mr: 0,
      borderRadius: RADIUS.xl,
      boxShadow: BOX_SHADOWS.sidebar,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {filters.map(def => (
        def.kind === 'multi'
          ? <MultiSelectFilter key={def.label} def={def} />
          : <SingleSelectFilter key={def.label} def={def} />
      ))}
      {filters.length > 0 && (
        <Button fullWidth onClick={onReset} sx={{ mt: SPACING.buttonInnerPadding, py: SPACING.buttonInnerPadding, fontSize: F.btnLabel, fontWeight: W.medium, color: C.white, backgroundColor: C.navy, '&:hover': { backgroundColor: C.midNavy, opacity: 0.9 } }}>
          Borrar filtros
        </Button>
      )}
      <Box sx={{ flex: 1 }} />
    </Box>
  )
}

export type { FilterDef, SingleFilterDef, MultiFilterDef }
export { Sidebar }

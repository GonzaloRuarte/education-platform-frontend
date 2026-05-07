'use client'

import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material'
import Button from '@/shared/components/Button'
import LogoAustral from '@/shared/components/LogoAustral'
import { ImageSize } from '@/shared/utils'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, LAYOUT_SIZES, BOX_SHADOWS } from '@/mta_reports_v2/constants'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS
const sidebarAustralLogoSize = new ImageSize(412, 72, { scale: 0.6 })

type FilterOption = string | { label: string; value: string }
interface FilterDef {
  label: string
  value: string
  opts: FilterOption[]
  set: (v: string) => void
}

const optLabel = (o: FilterOption) => (typeof o === 'string' ? o : o.label)
const optValue = (o: FilterOption) => (typeof o === 'string' ? o : o.value)

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const selectSx = {
    bgcolor: C.white,
    fontSize: F.select,
    borderRadius: 0,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.navyAlpha15 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '& .MuiSelect-select': { py: '12px', px: '16px' },
  }
  const labelSx = {
    color: C.navy,
    fontSize: F.select,
    fontWeight: W.bold,
    mb: 1,
  }
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
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 3 }}>
          <Typography sx={labelSx}>{label}</Typography>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => {
              const v = optValue(o)
              return <MenuItem key={v} value={v} sx={{ fontSize: F.kpiLabel }}>{optLabel(o)}</MenuItem>
            })}
          </Select>
        </FormControl>
      ))}
      <Button fullWidth onClick={onReset} sx={{ mt: SPACING.buttonInnerPadding, py: SPACING.buttonInnerPadding, fontSize: F.btnLabel, fontWeight: W.medium, color: C.white, backgroundColor: C.navy, '&:hover': { backgroundColor: C.midNavy, opacity: 0.9 } }}>
        Borrar filtros
      </Button>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ pt: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: sidebarAustralLogoSize.w, height: sidebarAustralLogoSize.h }}>
          <LogoAustral width={sidebarAustralLogoSize.w} height={sidebarAustralLogoSize.h} />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: C.navyMid,
            WebkitMaskImage: 'url(/logo_austral_@2x.png)',
            maskImage: 'url(/logo_austral_@2x.png)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }} />
        </Box>
      </Box>
    </Box>
  )
}

export type { FilterDef }
export { Sidebar }

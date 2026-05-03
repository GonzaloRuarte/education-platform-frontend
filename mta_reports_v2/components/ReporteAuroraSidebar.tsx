'use client'

import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import { COLORS } from '@/mta_reports_v2/constants'
import { BorderAllRounded } from '@mui/icons-material'

const C = COLORS
const sidebarAustralLogoSize = new ImageSize(412, 72, { scale: 0.5 })

interface FilterDef {
  label: string
  value: string
  opts: string[]
  set: (v: string) => void
}

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const selectSx = {
    bgcolor: C.white,
    fontSize: 15,
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.navyAlpha15 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '& .MuiSelect-select': { py: '10px', px: '14px' },
  }
  const labelSx = {
    color: C.navy,
    fontSize: 14,
    fontWeight: 700,
    mb: 1,
  }
  return (
    <Box sx={{
      width: 280,
      minHeight: 0,
      flexShrink: 0,
      bgcolor: C.white,
      px: 2.5,
      pt: 3.5,
      pb: 2.5,
      m: 2,
      borderRadius: 4,
      boxShadow: `0 12px 40px ${C.blackAlpha15}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 3 }}>
          <Typography sx={labelSx}>{label}</Typography>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 15 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ))}
      <Button fullWidth onClick={onReset} sx={{ mt: 1.5, fontSize: 14, fontWeight: 700, color: C.white, backgroundColor: C.navy, '&:hover': { backgroundColor: C.navy, opacity: 0.9 } }}>
        Borrar filtros
      </Button>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ borderTop: `1px solid ${C.navyAlpha15}`, pt: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Box
          aria-label="Universidad Austral"
          sx={{
            width: sidebarAustralLogoSize.w,
            height: sidebarAustralLogoSize.h,
            bgcolor: C.navy,
            WebkitMaskImage: 'url(/logo_austral_@2x.png)',
            maskImage: 'url(/logo_austral_@2x.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </Box>
    </Box>
  )
}

export type { FilterDef }
export { Sidebar }

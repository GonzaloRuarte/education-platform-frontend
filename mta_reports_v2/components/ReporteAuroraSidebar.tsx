'use client'

import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material'
import Button from '@/shared/components/Button'
import LogoAustral from '@/shared/components/LogoAustral'
import { ImageSize } from '@/shared/utils'
import { COLORS } from '@/mta_reports_v2/constants'
import { BorderAllRounded } from '@mui/icons-material'

const C = COLORS
const sidebarAustralLogoSize = new ImageSize(412, 72, { scale: 0.6 })

interface FilterDef {
  label: string
  value: string
  opts: string[]
  set: (v: string) => void
}

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const selectSx = {
    bgcolor: C.white,
    fontSize: 16,
    borderRadius: 0,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.navyAlpha15 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.navy },
    '& .MuiSelect-select': { py: '12px', px: '16px' },
  }
  const labelSx = {
    color: C.navy,
    fontSize: 16,
    fontWeight: 700,
    mb: 1,
  }
  return (
    <Box sx={{
      width: 300,
      minHeight: 0,
      flexShrink: 0,
      bgcolor: C.white,
      px: 4,
      pt: 9,
      pb: 4,
      m: 2,
      mr: 0,
      borderRadius: 9,
      boxShadow: `0 3px 14px ${C.blackAlpha20}, 0 3px 5px ${C.blackAlpha20}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 3 }}>
          <Typography sx={labelSx}>{label}</Typography>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 17 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ))}
      <Button fullWidth onClick={onReset} sx={{ mt: 1.5, py: 1.5, fontSize: 18, fontWeight: 500, color: C.white, backgroundColor: C.navy, '&:hover': { backgroundColor: "#003366", opacity: 0.9 } }}>
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

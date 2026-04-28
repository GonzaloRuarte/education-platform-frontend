'use client'

import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material'
import Button from '@/shared/components/Button'
import LogoAustral from '@/shared/components/LogoAustral'
import { ImageSize } from '@/shared/utils'
import { COLORS } from '@/mta_reports_v2/constants'
import { BorderAllRounded } from '@mui/icons-material'

const C = COLORS
const sidebarAustralLogoSize = new ImageSize(412, 72, { scale: 0.29 })

interface FilterDef {
  label: string
  value: string
  opts: string[]
  set: (v: string) => void
}

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
  const selectSx = {
    bgcolor: 'white',
    fontSize: 13,
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { py: '8px', px: '12px' },
  }
  const labelSx = {
    color: '#cfe1ff',
    fontSize: 12,
    fontWeight: 700,
    mb: 0.75,
  }
  return (
    <Box sx={{
      width: 220,
      minHeight: '100vh',
      flexShrink: 0,
      background: `linear-gradient(180deg, ${C.navy} 0%, ${C.blue} 100%)`,
      px: 2,
      pt: 2.75,
      pb: 2,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 2.5 }}>
          <Typography sx={labelSx}>{label}</Typography>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ))}
      <Button bgcolor="purple" fullWidth onClick={onReset} sx={{ mt: 1, fontSize: 12, fontWeight: 700, color: 'white' }}>
        Borrar filtros
      </Button>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 1.5, display: 'flex', justifyContent: 'center' }}>
        <LogoAustral width={sidebarAustralLogoSize.w} height={sidebarAustralLogoSize.h} />
      </Box>
    </Box>
  )
}

export type { FilterDef }
export { Sidebar }

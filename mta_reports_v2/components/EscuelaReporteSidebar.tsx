'use client'

import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import Button from '@/shared/components/Button'
import LogoAustral from '@/shared/components/LogoAustral'
import { ImageSize } from '@/shared/utils'
import { COLORS } from '@/mta_reports_v2/constants'

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
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { py: '7px' },
  }
  const labelSx = {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: 700,
    '&.Mui-focused': { color: 'white' },
    '&.MuiFormLabel-filled': { color: 'white' },
  }
  return (
    <Box sx={{
      width: 200,
      minHeight: '100vh',
      flexShrink: 0,
      background: `linear-gradient(180deg, ${C.navy} 0%, ${C.blue} 100%)`,
      px: 1.75,
      pt: 2.5,
      pb: 2,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 2.25 }}>
          <InputLabel sx={labelSx}>{label}</InputLabel>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ))}
      <Button bgcolor="red" fullWidth onClick={onReset} sx={{ mt: 0.5, fontSize: 12 }}>
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

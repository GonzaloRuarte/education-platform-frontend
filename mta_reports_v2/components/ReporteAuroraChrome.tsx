'use client'

import { Box, Stack, Chip, IconButton, Select, MenuItem } from '@mui/material'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Logo from '@/shared/components/Logo'
import { ImageSize } from '@/shared/utils'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS
const headerLogoSize = new ImageSize(257, 73, { scale: 0.85 })

export function ReportHeader({
  schoolName, tabLabel, canManage, reportId, reportStatus, statusBusy, onTogglePublish,
}: {
  schoolName: string
  tabLabel: string
  canManage: boolean
  reportId: number | null | undefined
  reportStatus: string | null | undefined
  statusBusy: boolean
  onTogglePublish: () => void
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 2, pl: 1, pr: 3, pt: 0.5, pb: 3 }}>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ color: C.navy, fontWeight: 800, lineHeight: 1 }}>
          {schoolName} — {tabLabel}
        </Typography>
        {canManage && reportId && (
          <Chip
            size="small"
            color={reportStatus === 'published' ? 'success' : 'warning'}
            label={reportStatus === 'published' ? 'Publicado' : 'Borrador'}
            onClick={onTogglePublish}
            disabled={statusBusy}
            sx={{ ml: 2, cursor: 'pointer' }}
          />
        )}
      </Box>
      <Logo width={headerLogoSize.w} height={headerLogoSize.h} />
    </Box>
  )
}

export function FilterPillsBar({ pills }: { pills: Array<{ label: string }> }) {
  return (
    <Stack direction="row" spacing={1} sx={{ pl: 1, pr: 3, pt: 0, pb: 4, flexWrap: 'wrap' }}>
      {pills.map(p => (
        <Chip key={p.label} label={p.label} size="medium" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
      ))}
    </Stack>
  )
}

export function TabPager<T extends string>({
  tab, tabs, labelOf, onChange, onPrev, onNext, isFirst, isLast,
}: {
  tab: T
  tabs: ReadonlyArray<T>
  labelOf: (id: T) => string
  onChange: (id: T) => void
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, bgcolor: 'white', boxShadow: 3, px: 1, py: 0.5 }}>
      <IconButton size="medium" onClick={onPrev} disabled={isFirst} sx={{ color: C.navy }}>
        <ChevronLeftIcon />
      </IconButton>
      <Select
        value={tab}
        onChange={e => onChange(e.target.value as T)}
        variant="standard"
        disableUnderline
        renderValue={value => {
          const idx = tabs.indexOf(value as T)
          return `${idx + 1} de ${tabs.length}`
        }}
        MenuProps={{
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'bottom', horizontal: 'center' },
          slotProps: { paper: { sx: { minWidth: 240 } } },
        }}
        sx={{ width: 110, color: C.navy, fontWeight: 600, fontSize: '0.8125rem', '& .MuiSelect-select': { py: 0.5, px: 1.5 } }}
      >
        {tabs.map((id, idx) => (
          <MenuItem key={id} value={id}>{idx + 1}. {labelOf(id)}</MenuItem>
        ))}
      </Select>
      <IconButton size="medium" onClick={onNext} disabled={isLast} sx={{ color: C.navy }}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  )
}

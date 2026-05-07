'use client'

import { Box, Stack, Chip, IconButton, Select, MenuItem, Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Logo from '@/shared/components/Logo'
import { ImageSize } from '@/shared/utils'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, LAYOUT_SIZES } from '@/mta_reports_v2/constants'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS
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
        <Typography variant="h3" sx={{ color: C.navy, fontWeight: W.extrabold, lineHeight: 1 }}>
          {schoolName} - {tabLabel}
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
        <Chip key={p.label} label={p.label} size="medium" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: W.semibold, fontSize: F.select, height: LAYOUT_SIZES.chipHeight, px: 0.5 }} />
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
  const arrowBtnSx = {
    color: C.navy,
    p: 0.25,
    borderRadius: RADIUS.sm,
    '&:hover': { bgcolor: C.navyAlpha12 },
  }
  const tooltipSlotProps = {
    tooltip: {
      sx: {
        bgcolor: C.white,
        color: C.navy,
        fontSize: F.chart.lg,
        fontWeight: W.semibold,
        px: 1.5,
        py: 0.75,
        boxShadow: `0 4px 16px 2px ${C.blackAlpha10}, 0 2px 6px ${C.blackAlpha04}`,
      },
    },
    arrow: { sx: { color: C.white } },
  }
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, bgcolor: C.pagerBg, borderTop: `1px solid ${C.pagerBorder}`, px: 1, py: 1 }}>
      <Tooltip title="Página Anterior" arrow placement="top" disableHoverListener={isFirst} disableFocusListener={isFirst} disableTouchListener={isFirst} slotProps={tooltipSlotProps}>
        <span>
          <IconButton size="small" onClick={onPrev} disabled={isFirst} sx={arrowBtnSx}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
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
          slotProps: {
            paper: {
              sx: {
                minWidth: 240,
                bgcolor: C.black,
                color: C.white,
                overflow: 'visible',
                mt: '-8px',
                '& .MuiMenu-list': { maxHeight: 360, overflowY: 'auto' },
                '& .MuiMenuItem-root': { color: C.white },
                '& .MuiMenuItem-root:hover': { bgcolor: C.whiteAlpha10 },
                '& .MuiMenuItem-root.Mui-selected': { bgcolor: C.whiteAlpha16 },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${C.black}`,
                },
              },
            },
          },
        }}
        sx={{ width: 110, color: C.navy, fontWeight: W.semibold, fontSize: '0.8125rem', '& .MuiSelect-select': { py: 0.5, px: 1.5 } }}
      >
        {tabs.map((id, idx) => (
          <MenuItem key={id} value={id}>{idx + 1}. {labelOf(id)}</MenuItem>
        ))}
      </Select>
      <Tooltip title="Página Siguiente" arrow placement="top" disableHoverListener={isLast} disableFocusListener={isLast} disableTouchListener={isLast} slotProps={tooltipSlotProps}>
        <span>
          <IconButton size="small" onClick={onNext} disabled={isLast} sx={arrowBtnSx}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

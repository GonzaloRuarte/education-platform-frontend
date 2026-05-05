'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import { COLORS, RADIUS } from '@/mta_reports_v2/constants'

const C = COLORS

const SubjectBadge = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      display: 'inline-block',
      bgcolor: C.subjectBadge,
      color: C.white,
      fontWeight: 800,
      fontSize: 26,
      px: 4,
      py: 3,
      borderRadius: RADIUS.pill,
      lineHeight: 1,
    }}
  >
    {children}
  </Box>
)

export { SubjectBadge }

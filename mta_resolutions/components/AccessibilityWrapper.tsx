'use client'

import Box from '@mui/material/Box'

import { useResolutionAccessibility } from '@/mta_resolutions/hooks/data'
import { T_FCwChildren } from '@/shared/types'

const AccessibilityWrapper: T_FCwChildren = ({ children }) => {
  const { requiresAccessibility } = useResolutionAccessibility()
  return <Box textTransform={requiresAccessibility ? 'uppercase' : 'none'}>{children}</Box>
}

export default AccessibilityWrapper

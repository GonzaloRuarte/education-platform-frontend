'use client'

import { useNetworkStatus } from '@/shared/offline/hooks'
import { Box } from '@mui/material'

const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus()
  if (isOnline) return null
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        textAlign: 'center',
        padding: '1px 10px',
        fontSize: 10,
        fontFamily: 'monospace',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        zIndex: 999999,
      }}
    >
      Sin conexión
    </Box>
  )
}

export default OfflineIndicator

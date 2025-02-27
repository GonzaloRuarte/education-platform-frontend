'use client'

import { useInProgress } from '@/shared/hooks'
import { CircularProgress } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'

const GlobalBackdrop = () => {
  const { isInProgress } = useInProgress()
  return (
    <Backdrop open={isInProgress} style={{ position: 'fixed', zIndex: 99999999999 }}>
      <CircularProgress />
    </Backdrop>
  )
}

export default GlobalBackdrop

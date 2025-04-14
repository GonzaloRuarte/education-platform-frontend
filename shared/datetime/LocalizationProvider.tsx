'use client'

import { LocalizationProvider as MUI_LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const LocalizationProvider = ({ children }) => {
  return <MUI_LocalizationProvider dateAdapter={AdapterDayjs}>{children}</MUI_LocalizationProvider>
}

export default LocalizationProvider

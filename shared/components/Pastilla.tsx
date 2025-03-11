import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { Box } from '@mui/material'

const Pastilla: T_FCwChildren = ({ children }) => {
  const theme = useTheme()
  return (
    <Box style={{ background: theme.palette.divider }} borderRadius={theme.shape.borderRadius} padding=".5em 1em">
      {children}
    </Box>
  )
}

export default Pastilla

import { T_FCwChildren } from '@/shared/types'
import { Box } from '@mui/material'

const GenericPageLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {children}
    </Box>
  )
}

export default GenericPageLayout

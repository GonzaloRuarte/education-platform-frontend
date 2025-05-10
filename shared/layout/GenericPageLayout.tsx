import { T_FCwChildren } from '@/shared/types'
import { Box } from '@mui/material'

const GenericPageLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box width="95%" maxWidth="1366px" sx={{ overflowX: 'auto' }} margin="0 auto">
      {children}
    </Box>
  )
}

export default GenericPageLayout

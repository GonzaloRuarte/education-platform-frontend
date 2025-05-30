import { Box } from '@mui/material'

const MultipleChoiceOptionContainer = ({ children }) => {
  return (
    <Box suppressContentEditableWarning={true} sx={{ borderBottom: '1px solid #DDD', width: '100%' }} p="8px 0">
      {children}
    </Box>
  )
}

export default MultipleChoiceOptionContainer

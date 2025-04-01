import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { Box } from '@mui/material'

const ResolutionReviewDisclaimer = () => {
  const t = useTheme()
  return (
    <Box bgcolor={'#C3D9FF'} borderRadius={5} padding={3} color={t.palette.primary.dark}>
      <H3>No te olvides de revisar tus respuestas</H3>
      <Spacer size="xs" />
      <Body1>Tomate un momento para revisar o modificar tus respuestas antes de avanzar.</Body1>
    </Box>
  )
}

export default ResolutionReviewDisclaimer

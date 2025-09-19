import { LIGHT_BG_COLOR } from '@/config'
import { Body1, H3 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { Box } from '@mui/material'

const ResolutionReviewDisclaimer = () => {
  const t = useTheme()
  return (
    <Box bgcolor={LIGHT_BG_COLOR} borderRadius={5} padding={3} color={t.palette.primary.dark}>
      <Body1>Tomate un momento para revisar o modificar tus respuestas antes de avanzar.</Body1>
    </Box>
  )
}

export default ResolutionReviewDisclaimer

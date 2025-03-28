import Box from '@mui/material/Box'

type TSpacingOptions = 'xs' | 'default' | 's' | 'm' | 'l' | 'xl' | 'xxl'

interface I_Props {
  size?: TSpacingOptions
}

const spacing: { [_ in TSpacingOptions]: number } = {
  xs: 8,
  s: 16,
  default: 24,
  m: 32,
  l: 42,
  xl: 60,
  xxl: 96,
}

/**
 * Adds vertical space between components
 */
const Spacer = ({ size = 'default' }: I_Props) => {
  return <Box sx={{ height: spacing[size] }} />
}

export default Spacer

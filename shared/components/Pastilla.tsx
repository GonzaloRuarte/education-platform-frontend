import { LIGHT_BG_COLOR } from '@/config'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { Box } from '@mui/material'
import { ComponentProps } from 'react'

interface I_Props extends ComponentProps<T_FCwChildren> {
  variant?: 'grey' | 'light_blue'
  padding?: ComponentProps<typeof Box>['padding']
}

const Pastilla = ({ children, variant = 'grey', padding = '.5em 1em' }: I_Props) => {
  const theme = useTheme()
  const colors = {
    grey: theme.palette.divider,
    light_blue: LIGHT_BG_COLOR,
  }
  return (
    <Box style={{ background: colors[variant] }} borderRadius={theme.shape.borderRadius} {...{ padding }}>
      {children}
    </Box>
  )
}

export default Pastilla

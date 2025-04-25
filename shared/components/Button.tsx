import { SxProps, Theme } from '@mui/material'
import MUI_Button from '@mui/material/Button'
import { green, grey, yellow, deepPurple, orange, red } from '@mui/material/colors'
import { ComponentProps } from 'react'

type T_BgColor = 'yellow' | 'orange' | 'purple' | 'green' | 'red'
interface I_Props extends ComponentProps<typeof MUI_Button> {
  bgcolor?: T_BgColor
}

const styles: Record<T_BgColor, SxProps<Theme>> = {
  yellow: { backgroundColor: yellow[700], color: grey[800] },
  orange: { backgroundColor: orange[700] },
  purple: { backgroundColor: deepPurple[700] },
  green: { backgroundColor: green[700], color: grey[100] },
  red: { backgroundColor: red[700] },
}

const Button = ({ variant = 'contained', bgcolor, sx, ...props }: I_Props) => {
  return (
    <MUI_Button
      // @ts-expect-error
      sx={{ ...(bgcolor !== undefined ? styles[bgcolor] : {}), ...sx }}
      {...{ ...props, variant }}
    />
  )
}

export default Button

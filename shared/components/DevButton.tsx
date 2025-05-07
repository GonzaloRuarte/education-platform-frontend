import { SxProps, Theme } from '@mui/material'
import MUI_Button from '@mui/material/Button'
import { green, grey, yellow, deepPurple, orange, red } from '@mui/material/colors'
import { ComponentProps } from 'react'

type T_BgColor = 'yellow' | 'orange' | 'purple' | 'green' | 'red' | 'grey'
interface I_Props extends ComponentProps<typeof MUI_Button> {
  bgcolor?: T_BgColor
}

const styles: Record<T_BgColor, SxProps<Theme>> = {
  yellow: { backgroundColor: yellow[700], color: grey[800] },
  orange: { backgroundColor: orange[700] },
  purple: { backgroundColor: deepPurple[700] },
  green: { backgroundColor: green[700], color: grey[100] },
  red: { backgroundColor: red[700] },
  grey: { backgroundColor: grey[600] },
}

const DevButton = ({ variant = 'contained', bgcolor = 'green', sx, ...props }: I_Props) => {
  return (
    <MUI_Button
      // @ts-expect-error
      sx={{ ...(bgcolor !== undefined ? styles[bgcolor] : {}), borderRadius: '3px !important', ...sx }}
      {...{ ...props, variant }}
    />
  )
}

export default DevButton

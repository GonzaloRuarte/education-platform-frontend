import MUI_Button from '@mui/material/Button'
import { ComponentProps } from 'react'

const Button = ({ variant = 'contained', ...props }: ComponentProps<typeof MUI_Button>) => <MUI_Button {...{ ...props, variant }} />

export default Button

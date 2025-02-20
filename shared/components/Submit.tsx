import React from 'react'
import { Button, ButtonProps } from '@mui/material'

type T_Props = Omit<ButtonProps, 'type'>

const Submit: React.FC<T_Props> = ({ children, ...props }) => (
  <Button type="submit" {...props}>
    {children}
  </Button>
)

export default Submit
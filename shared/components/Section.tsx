import React from 'react'
import Box from '@mui/material/Box'
import type { ComponentProps } from "react"

type T_BoxProps = Omit<ComponentProps<typeof Box>, 'component'>

const Section = (props: T_BoxProps) => <Box {...props} component='section' />

export default Section
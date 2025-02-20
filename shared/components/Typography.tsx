import React from 'react'
import MuiTypography, { TypographyProps } from '@mui/material/Typography'


type Props = Omit<TypographyProps, 'variant'>

const H1: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h1" {...props}>
    {children}
  </MuiTypography>
)

const H2: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h2" {...props}>
    {children}
  </MuiTypography>
)

const H3: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h3" {...props}>
    {children}
  </MuiTypography>
)

const H4: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h4" {...props}>
    {children}
  </MuiTypography>
)

const H5: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h5" {...props}>
    {children}
  </MuiTypography>
)

const H6: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="h6" {...props}>
    {children}
  </MuiTypography>
)

const Body1: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="body1" {...props}>
    {children}
  </MuiTypography>
)

const Body2: React.FC<Props> = ({ children, ...props }) => (
  <MuiTypography variant="body2" {...props}>
    {children}
  </MuiTypography>
)

export { H1, H2, H3, H4, H5, H6, Body1, Body2 }
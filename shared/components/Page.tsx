import Box from '@mui/material/Box'
import React from 'react'
import Typography from '@mui/material/Typography'
import Section from '@/shared/components/Section'
import Spacer from '@/shared/components/Spacer'

interface I_Props {
  children: React.ReactNode
  disableMarginBottom?: boolean
}

const Page = ({ children }: I_Props) => <Box component="section">{children}</Box>

Page.Title = ({ children, disableMarginBottom = false }: I_Props) => {
  return (
    <>
      <Typography variant="h1">{children}</Typography>
      {!disableMarginBottom && <Spacer />}
    </>
  )
}
Page.Content = ({ children }: I_Props) => <Section children={children} />
Page.Toolbar = ({ children }: I_Props) => (
  <Box>
    <Section>{children}</Section>
    <Spacer space="s" />
  </Box>
)

export default Page

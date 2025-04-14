import MagicGrid from '@/shared/components/MagicGrid'
import Section from '@/shared/components/Section'
import Spacer from '@/shared/components/Spacer'
import { Grid2 } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'

interface I_PageProps {
  children: React.ReactNode
}
interface I_TitleProps {
  children: React.ReactNode
  disableMarginBottom?: boolean
}
interface I_ContentProps {
  children: React.ReactNode
}

interface I_ToolbarProps {
  children: React.ReactNode
  right?: React.ReactNode
}

const Page = ({ children }: I_PageProps) => <Box component="section">{children}</Box>

Page.Title = ({ children, disableMarginBottom = false }: I_TitleProps) => {
  return (
    <>
      <Typography variant="h1">{children}</Typography>
      {!disableMarginBottom && <Spacer />}
    </>
  )
}
Page.Content = ({ children }: I_ContentProps) => <Section children={children} />
Page.Toolbar = ({ children, right = undefined }: I_ToolbarProps) => (
  <Box>
    <Section>
      <Grid2 container>
        <MagicGrid itemSize="auto">{children}</MagicGrid>

        {right !== undefined && (
          <>
            <Grid2 size="grow" />
            <Grid2>{right}</Grid2>
          </>
        )}
      </Grid2>
    </Section>
    <Spacer size="m" />
  </Box>
)

export default Page

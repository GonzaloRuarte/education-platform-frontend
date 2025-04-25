import { BackButton, ReloadButton } from '@/shared/components/buttons'
import DeleteInstanceButton from '@/shared/components/DeleteInstanceButton'
import MagicGrid from '@/shared/components/MagicGrid'
import Section from '@/shared/components/Section'
import Spacer from '@/shared/components/Spacer'
import { T_DeletionServiceHook, T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
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

function BasicToolbar<T_Id extends number | string, T_Response>(p: {
  id: T_Id
  onExit: T_VoidFn
  reload: T_VoidFn
  useDelete?: T_DeletionServiceHook<T_Id, T_Response>
  entityName: EntityName
}) {
  return (
    <Page.Toolbar>
      <BackButton onClick={p.onExit} />
      <ReloadButton onClick={p.reload} />
      {p.useDelete !== undefined && (
        <DeleteInstanceButton<T_Id> callback={p.onExit} entityName={p.entityName} useDelete={p.useDelete} id={p.id} />
      )}
    </Page.Toolbar>
  )
}

Page.BasicToolbar = BasicToolbar

export default Page

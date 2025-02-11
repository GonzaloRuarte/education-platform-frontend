import { Box } from '@mui/material'
import React from 'react'
import Typography from '@mui/material/Typography'
import Section from '@/shared/components/Section'


interface I_Props {
  children: React.ReactNode
}

const Page = ({ children }: I_Props) => <Box component='section'>{children}</Box>


Page.Title = ({ children }: I_Props) => {
  return <Typography>{children}</Typography>
}
Page.Content = ({ children }: I_Props) => <Section children={children} />

export default Page
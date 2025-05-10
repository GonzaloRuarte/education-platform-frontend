'use client'

import StudentsLoginForm from '@/mta_auth/components/StudentsLoginForm'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import { Body1, H1, H3 } from '@/shared/components/Typography'
import { ImageSize } from '@/shared/utils'
import Box from '@mui/material/Box'
import { useEffect } from 'react'

const logoSize = new ImageSize(262, 74, { scale: 0.5 })
const StudentsLogin = () => {
  const { storeNewPage } = useResolutionPagination()
  useEffect(() => {
    storeNewPage(1)
  }, [])
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Box width="30vw">
        {/* <Paper style={{ padding: 30 }}> */}
        <Logo variant="color" width={logoSize.w} height={logoSize.h} />
        <Spacer size="l" />
        <H1>¡Hola!</H1>
        <Spacer size="xs" />

        <Body1>Para comenzar tu evaluación ingresá con tu número de DNI.</Body1>
        <Spacer size="m" />
        <StudentsLoginForm />
        {/* </Paper> */}
      </Box>
    </Box>
  )
}

export default StudentsLogin

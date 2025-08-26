'use client'

import StudentsLoginForm from '@/mta_auth/components/StudentsLoginForm'
import { useIsAuthorized } from '@/mta_auth/hooks'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionState } from '@/mta_resolutions/hooks/data'
import { useNavigateToResolutionPage } from '@/mta_resolutions/hooks/navigation'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import { Body1, H1 } from '@/shared/components/Typography'
import { ImageSize } from '@/shared/utils'
import Box from '@mui/material/Box'
import { useEffect } from 'react'

const logoSize = new ImageSize(262, 74, { scale: 0.5 })

const StudentsLogin = () => {
  const { storeNewPage } = useResolutionPagination()
  useEffect(() => {
    // Reset pagination when entering the login flow
    storeNewPage(1)
  }, [storeNewPage])

  const navToResolution = useNavigateToResolutionPage()
  const resolutionState = useResolutionState()
  const isAuthorized = useIsAuthorized()

  // ✅ Only auto-redirect when the user is truly authorized AND we have a valid student_personal_id
  useEffect(() => {
    if (!isAuthorized) return
    const pid = resolutionState?.student_personal_id
    if (!pid) return

    // Prefer a replace internally if your navigate hook supports it to avoid back-button loops
    navToResolution()
  }, [isAuthorized, resolutionState?.student_personal_id, navToResolution])

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Box width="30vw">
          <Logo variant="color" width={logoSize.w} height={logoSize.h} />
          <Spacer size="l" />
          <H1>¡Hola!</H1>
          <Spacer size="xs" />
          <Body1>Para comenzar tu evaluación ingresá con tu número de DNI.</Body1>
          <Spacer size="m" />
          <StudentsLoginForm />
        </Box>
      </Box>
    </>
  )
}

export default StudentsLogin

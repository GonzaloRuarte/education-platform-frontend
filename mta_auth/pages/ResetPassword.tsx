'use client'

import ResetPasswordForm from '@/mta_auth/components/ResetPasswordForm'
import pages from '@/pages'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { ImageSize } from '@/shared/utils'
import Box from '@mui/material/Box'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const logoSize = new ImageSize(262, 74, { scale: 0.5 })

const ResetPassword = () => {
    const params = useParams<{ uid: string; token: string }>()

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Box width="30vw">
                <Logo variant="color" width={logoSize.w} height={logoSize.h} />
                <Spacer />
                <H3>Restablecer contraseña</H3>
                <Spacer size="s" />
                <Body1>Ingresá tu nueva contraseña.</Body1>
                <Spacer />
                <ResetPasswordForm uid={String(params.uid)} token={String(params.token)} />
                <Spacer size="s" />
                <Link href={pages.D._.login.path}>Volver al login</Link>
            </Box>
        </Box>
    )
}

export default ResetPassword
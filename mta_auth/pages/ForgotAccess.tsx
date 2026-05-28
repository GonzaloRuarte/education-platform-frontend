'use client'

import ForgotAccessForm from '@/mta_auth/components/ForgotAccessForm'
import { avoidAuthorized } from '@/mta_auth/hocs/AvoidAuthorized'
import pages from '@/pages'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { ImageSize } from '@/shared/utils'
import Box from '@mui/material/Box'
import Link from 'next/link'

const logoSize = new ImageSize(262, 74, { scale: 0.5 })

const ForgotAccess = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Box width="30vw">
                <Logo variant="color" width={logoSize.w} height={logoSize.h} />
                <Spacer />
                <H3>Recuperar acceso</H3>
                <Spacer size="s" />
                <Body1>Ingresá tu email para recibir tu nombre de usuario y un enlace para crear una nueva contraseña.</Body1>
                <Spacer />
                <ForgotAccessForm />
                <Spacer size="s" />
                <Link href={pages.D._.login.path}>Volver al login</Link>
            </Box>
        </Box>
    )
}

export default avoidAuthorized(ForgotAccess)

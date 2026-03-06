'use client'

import { useForgotAccess } from '@/mta_auth/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body2 } from '@/shared/components/Typography'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
    email: string
}

export default function ForgotAccessForm() {
    const { handleSubmit, control } = useForm<I_FormFields>({
        defaultValues: {
            email: '',
        },
    })

    const forgotAccess = useForgotAccess()
    const { setInProgressStatus } = useInProgress()
    const [emailSent, setEmailSent] = useState(false)

    const onSubmit: SubmitHandler<I_FormFields> = (data) => {
        setInProgressStatus(true)
        forgotAccess(data)
            .then(() => {
                successToast('Si el email existe, te enviamos las instrucciones.')
                setEmailSent(true)
            })
            .catch(handleServiceError)
            .finally(() => {
                setInProgressStatus(false)
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <MagicGrid>
                <InputControlled<I_FormFields>
                    control={control}
                    name="email"
                    type="email"
                    label="Email"
                    rules={{ ...rules.required() }}
                />
            </MagicGrid>

            {emailSent && (
                <>
                    <Spacer size="s" />
                    <Body2>
                        Si el email existe en el sistema, te enviamos un correo con tu nombre de usuario y un enlace para crear una
                        nueva contraseña.
                    </Body2>
                </>
            )}

            <Spacer />
            <Submit>Enviar instrucciones</Submit>
        </form>
    )
}
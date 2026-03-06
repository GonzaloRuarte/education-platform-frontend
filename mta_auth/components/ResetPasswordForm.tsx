'use client'

import { usePasswordResetConfirm } from '@/mta_auth/hooks'
import pages from '@/pages'
import PasswordField from '@/shared/components/PasswordField'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

interface I_FormFields {
    new_password: string
    repeat_new_password: string
}

interface I_Props {
    uid: string
    token: string
}

export default function ResetPasswordForm({ uid, token }: I_Props) {
    const router = useRouter()
    const clearAuthData = useStore((state) => state.auth_clearAuthData)
    const passwordResetConfirm = usePasswordResetConfirm()
    const { setInProgressStatus } = useInProgress()

    const { handleSubmit, control } = useForm<I_FormFields>({
        defaultValues: {
            new_password: '',
            repeat_new_password: '',
        },
    })

    const new_password = useWatch({ control, name: 'new_password' })

    const onSubmit: SubmitHandler<I_FormFields> = (data) => {
        setInProgressStatus(true)
        passwordResetConfirm({
            uid,
            token,
            new_password: data.new_password,
        })
            .then(() => {
                clearAuthData()
                successToast('Contraseña actualizada correctamente.')
                router.push(pages.D._.login.path)
            })
            .catch(handleServiceError)
            .finally(() => {
                setInProgressStatus(false)
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <MagicGrid>
                <PasswordField<I_FormFields>
                    control={control}
                    name="new_password"
                    rules={{
                        ...rules.required(),
                        ...rules.minLength(8),
                    }}
                    label="Nueva contraseña"
                />
                <PasswordField<I_FormFields>
                    control={control}
                    name="repeat_new_password"
                    rules={{
                        ...rules.required(),
                        validate: (value) => value === new_password || 'Las contraseñas no coinciden',
                    }}
                    label="Repetir nueva contraseña"
                />
            </MagicGrid>
            <Spacer />
            <Submit>Guardar nueva contraseña</Submit>
        </form>
    )
}
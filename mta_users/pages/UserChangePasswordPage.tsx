'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useNavigateToUserList, useUserChangePassword } from '@/mta_users/hooks'
import { BackButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { successToast } from '@/shared/toasts'
import { useParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'

interface I_FormFields {
  // old_password: string
  new_password: string
  repeat_new_password: string
}
const UserChangePasswordPage = () => {
  const { userId } = useParams()
  const navToList = useNavigateToUserList()

  const { executeAction: changePassword } = useUserChangePassword({ id: Number(userId) }, useInProgress)
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      // old_password: '',
      new_password: '',
      repeat_new_password: '',
    },
  })
  const new_password = useWatch({ control, name: 'new_password' })

  const onSubmit = (formData: I_FormFields) => {
    changePassword({
      new_password: formData.new_password,
    }).then(() => {
      successToast('Password cambiada correctamente.')
      navToList()
    })
  }
  return (
    <>
      <Page>
        <Page.Title>Cambiar Password</Page.Title>
        <Page.Toolbar>
          <BackButton onClick={navToList} />
        </Page.Toolbar>
        <Page.Content>
          <form onSubmit={handleSubmit(onSubmit)}>
            <MagicGrid>
              {/* <InputControlled<I_FormFields>
                control={control}
                name="old_password"
                rules={{
                  ...rules.required(),
                }}
                label="Contraseña actual"
                type="password"
              /> */}
              <InputControlled<I_FormFields>
                control={control}
                name="new_password"
                rules={{
                  ...rules.required(),
                  ...rules.minLength(6),
                  ...rules.pattern(
                    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                    'Debe contener al menos una letra y un número',
                  ),
                }}
                label="Nueva Contraseña"
                type="password"
              />
              <InputControlled<I_FormFields>
                control={control}
                name="repeat_new_password"
                rules={{
                  ...rules.required(),
                  validate: (value) => value === new_password || 'Las contraseñas no coinciden',
                }}
                label="Repetir nueva contraseña"
                type="password"
              />
            </MagicGrid>
            <Spacer />
            <Submit>Cambiar password</Submit>
          </form>
        </Page.Content>
      </Page>
    </>
  )
}

export default withAuth(UserChangePasswordPage, { logoutDestination: 'dashboard', allowedUserProfiles: ['admin'] })

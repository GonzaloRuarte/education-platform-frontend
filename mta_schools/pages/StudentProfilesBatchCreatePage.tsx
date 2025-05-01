'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileBatchCreate } from '@/mta_schools/hooks'
import Button from '@/shared/components/Button'
import { BackButton } from '@/shared/components/buttons'
import Page from '@/shared/components/Page'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { errorToast, successToast } from '@/shared/toasts'
import { sentence } from '@/shared/utils'
import { TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'
import Link from 'next/link'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields {
  school_id: number
  file: FileList
}

const StudentProfilesBatchCreatePage = () => {
  const backToList = useNavigateToStudentProfileList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<I_FormFields>()

  const batchCreate = useStudentProfileBatchCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    if (!data.file || data.file.length === 0) {
      errorToast('Debe seleccionar un archivo.')
      return
    }

    const formData = new FormData()
    formData.append('school_id', String(data.school_id)) // Convertir school_id a string
    formData.append('file', data.file[0]) // Solo se envía el primer archivo
    console.log('formData')

    setIsInProgress()
    batchCreate(formData)
      .then((res) => {
        log.info('Students created succesfully:', res)

        successToast(sentence(`${STUDENT_PROFILE_NAME.plural} creados correctamente`))
        backToList()
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsNotInProgress()
      })
  }

  return (
    <Page>
      <Page.Title>Agregar {STUDENT_PROFILE_NAME.singular}</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={backToList} />
      </Page.Toolbar>
      <Page.Content>
        <Grid container spacing={12}>
          <Grid size={7}>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <Grid container spacing={3}>
                <Grid size={12}>
                  <SchoolSelectControlled
                    control={control}
                    name="school_id"
                    rules={{ required: 'Debe seleccionar una escuela' }}
                    label="Escuela"
                  />
                  {errors.school_id && <p style={{ color: 'red' }}>{errors.school_id.message}</p>}
                </Grid>
                <Grid size={12}>
                  <TextField
                    type="file"
                    slotProps={{
                      htmlInput: {
                        accept:
                          '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
                      },
                    }}
                    {...register('file', { required: 'Debe seleccionar un archivo' })}
                    fullWidth
                  />
                  {errors.file && <p style={{ color: 'red' }}>{errors.file.message}</p>}
                </Grid>
              </Grid>
              <Spacer />
              <Submit>Crear estudiantes</Submit>
            </form>
          </Grid>
          <Grid size={5}>
            <Pastilla variant="light_blue" padding={'2em'}>
              <H4>Archivo base</H4>
              <Spacer />
              <Body1>
                Podés descargar este archivo base, el cual te servirá como plantilla para cargar nuevos alumnos.
              </Body1>
              <Spacer />
              <Button LinkComponent={Link} href="/Meta--PlanillaBaseAlumnos.xlsx">
                Descargar
              </Button>
            </Pastilla>
          </Grid>
        </Grid>
      </Page.Content>
    </Page>
  )
}

export default withAuth(StudentProfilesBatchCreatePage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})

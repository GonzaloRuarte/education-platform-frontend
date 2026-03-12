'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { SchoolSelectControlled } from '@/mta_schools/components/SchoolSelect'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileBatchCreate } from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import { I_SchoolName, T_SchoolNames } from '@/mta_schools/types'
import Button from '@/shared/components/Button'
import { BackButton } from '@/shared/components/buttons'
import Page from '@/shared/components/Page'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Submit from '@/shared/components/Submit'
import { Body1, H4 } from '@/shared/components/Typography'
import { useInProgress } from '@/shared/hooks'

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

interface I_Props {
  selectedSchool: I_SchoolName | null
  availableSchools: T_SchoolNames
  lockSchool: boolean
}

const StudentProfilesBatchCreatePageContent = ({ selectedSchool, availableSchools, lockSchool }: I_Props) => {
  const backToList = useNavigateToStudentProfileList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<I_FormFields>({ defaultValues: { school_id: selectedSchool !== null ? selectedSchool.id : undefined } })

  const batchCreate = useStudentProfileBatchCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    if (!data.file || data.file.length === 0) {
      errorToast('Debe seleccionar un archivo.')
      return
    }

    const formData = new FormData()
    formData.append('school_id', String(data.school_id))
    formData.append('file', data.file[0])

    setIsInProgress()
    batchCreate(formData)
      .then(() => {
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
      <Page.Title>Carga masiva de {STUDENT_PROFILE_NAME.plural}</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={backToList} />
      </Page.Toolbar>
      <Page.Content>
        <Grid container spacing={12}>
          <Grid size={7}>
            <Body1>
              Se cargarán los estudiantes incluidos en el archivo Excel. Si alguno ya existe en el sistema (identificado por su DNI), sus datos se actualizarán automáticamente con la información proporcionada en el archivo.
            </Body1>
            <Spacer />
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <Grid container spacing={3}>
                {!lockSchool ? (
                  <Grid size={12}>
                    <SchoolSelectControlled
                      control={control}
                      name="school_id"
                      rules={{ required: 'Debe seleccionar una escuela' }}
                      label="Escuela"
                      options={availableSchools}
                    />
                    {errors.school_id && <p style={{ color: 'red' }}>{errors.school_id.message}</p>}
                  </Grid>
                ) : (
                  <H4>{selectedSchool?.name}</H4>
                )}
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
              <Submit>Cargar estudiantes</Submit>
            </form>
          </Grid>
          <Grid size={5}>
            <Pastilla variant="light_blue" padding={'2em'}>
              <H4>Archivo base</H4>
              <Spacer />
              <Body1>
                Descargá este archivo: es la plantilla oficial que debés usar para cargar los datos de los nuevos alumnos. Por favor, no lo reemplaces por otro formato.
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
const StudentProfilesBatchCreatePage = () => {
  const { isLoading, selectedSchool, accessibleSchools, hasSingleSchool } = useSchoolScopeResources()

  if (isLoading || accessibleSchools === undefined || selectedSchool === undefined) return <Spinner />
  return (
    <StudentProfilesBatchCreatePageContent
      selectedSchool={selectedSchool}
      availableSchools={accessibleSchools}
      lockSchool={!!hasSingleSchool}
    />
  )
}
export default withAuth(StudentProfilesBatchCreatePage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})

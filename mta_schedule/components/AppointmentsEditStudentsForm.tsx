'use client'

import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { T_AddedStudents } from '@/mta_schedule/components/StudentsProfileSelector'
import { ControlledStudentsProfileSelector } from '@/mta_schedule/components/StudentsProfileSelectorControlled'
import { APPOINTMENT_MAX_STUDENTS } from '@/mta_schedule/constants'
import { useAppointmentAddStudents, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import { I_AppointmentDetail } from '@/mta_schedule/types'
import { I_SchoolName } from '@/mta_schools/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import { useConfirm } from '@/shared/confirm'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Box, Button } from '@mui/material'
import { useForm } from 'react-hook-form'

interface I_FormFields {
  student_profiles: T_AddedStudents
}

interface I_Props {
  data: I_AppointmentDetail
}

const AppointmentsEditStudentsForm = ({ data }: I_Props) => {
  const navToList = useNavigateToAppointmentList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()
  const addStudents = useAppointmentAddStudents()

  const { control, handleSubmit } = useForm<I_FormFields>({
    defaultValues: {
      student_profiles: Object.fromEntries(
        data.students.map(({ cohort, id, personal_id }) => [id, { personal_id, cohort }]),
      ),
    },
  })
  const addStudentProfiles = (formData: I_FormFields) => {
    showConfirm('Agregar estudantes', '¿Estás seguro/a que quieres agregar estos/as estudantes?').then(() => {
      setIsInProgress()
      addStudents({
        appointment_id: Number(data.id),
        student_profile_ids: Object.keys(formData.student_profiles).map((id) => Number(id)),
      })
        .then(() => {
          successToast('Estudiantes agregados correctamente')
          navToList()
        })
        .catch(handleServiceError)
        .finally(setIsNotInProgress)
    })
  }

  return (
    <>
      <MagicGrid>
        <AppointmentBriefCard
          appointmentId={data.id}
          begins_at={data.begins_at}
          title={data.school?.name}
          subject={data.requested_evaluation_subject?.name}
          grade={data.requested_evaluation_grade === null ? undefined : data.requested_evaluation_grade}
          evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
          comments={data.comments}
        />
        <Spacer />
        <form onSubmit={handleSubmit(addStudentProfiles)}>
          <ControlledStudentsProfileSelector
            schoolId={(data.school as I_SchoolName).id}
            name="student_profiles"
            control={control}
            rules={{
              validate: (student_profiles) => {
                if (Object.values(student_profiles).length === 0) return 'Debe agregar al menos un estudiante'
                if (Object.values(student_profiles).length > APPOINTMENT_MAX_STUDENTS)
                  return `El turno puede tener un máximo de ${APPOINTMENT_MAX_STUDENTS} estudiantes`

                return true
              },
            }}
          />
          <Spacer />
          <Box sx={{ borderBottom: '3px solid #CCC' }} />
          <Spacer />
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </form>
      </MagicGrid>
      <ConfirmDialogComponent />
    </>
  )
}

export default AppointmentsEditStudentsForm

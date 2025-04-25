'use client'

import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { T_AddedStudents } from '@/mta_schedule/components/StudentsProfileSelector'
import { ControlledStudentsProfileSelector } from '@/mta_schedule/components/StudentsProfileSelectorControlled'
import { useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import { I_AppointmentDetail } from '@/mta_schedule/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import { useConfirm } from '@/shared/confirm'
import { useInProgress } from '@/shared/hooks'
import { Button } from '@mui/material'
import { useForm } from 'react-hook-form'

interface I_FormFields {
  student_profiles: T_AddedStudents
}

interface I_Props {
  data: I_AppointmentDetail
}

const AppointmentsEditStudentsForm = ({ data }: I_Props) => {
  const navToList = useNavigateToAppointmentList()
  const { setIsInProgress } = useInProgress()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const { control, handleSubmit } = useForm<I_FormFields>({
    defaultValues: {
      student_profiles: Object.fromEntries(
        data.students.map(({ cohort, id, personal_id }) => [id, { personal_id, cohort }]),
      ),
    },
  })
  const addStudentProfiles = (data: I_FormFields) => {
    console.log({ data })
  }
  return (
    <>
      <MagicGrid>
        <AppointmentBriefCard
          appointmentId={data.id}
          begins_at={data.begins_at}
          title={data.school.name}
          subject={data.requested_evaluation_subject.name}
          grade={data.requested_evaluation_grade}
          evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
        />
        <Spacer />
        <form onSubmit={handleSubmit(addStudentProfiles)}>
          <ControlledStudentsProfileSelector
            schoolId={data.school.id}
            name="student_profiles"
            control={control}
            rules={{
              validate: (student_profiles) => {
                if (Object.values(student_profiles).length === 0) return 'Debe agregar al menos un estudiante'

                return true
              },
            }}
          />
          <Spacer />
          <Button type="submit" variant="contained" color="primary">
            Aprobar Turno
          </Button>
        </form>
      </MagicGrid>
      <ConfirmDialogComponent />
    </>
  )
}

export default AppointmentsEditStudentsForm

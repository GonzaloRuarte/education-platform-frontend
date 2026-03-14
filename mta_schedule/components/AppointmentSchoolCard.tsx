import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import RescheduleDialog from '@/mta_schedule/components/AppointmentRescheduleDialog'
import { useNavigateToAppointmentDetail, useNavigateToAppointmentEditStudents } from '@/mta_schedule/hooks'
import { AppointmentOccurrenceStatus, AppointmentStatus, I_AppointmentSchoolCardItem } from '@/mta_schedule/types'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1 } from '@/shared/components/Typography'
import Box from '@mui/material/Box'
import { useState } from 'react'

interface I_Props {
  data: I_AppointmentSchoolCardItem
  onRescheduled?: () => void
  canViewDetail?: boolean
  canEditStudents?: boolean
  canReschedule?: boolean
}

const AppointmentSchoolCard = ({
  data,
  onRescheduled,
  canViewDetail = true,
  canEditStudents = true,
  canReschedule = true,
}: I_Props) => {
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const navToDetail = useNavigateToAppointmentDetail()
  const [open, setOpen] = useState(false)

  const canManageStudentsForAppointment =
    canEditStudents &&
    (data.occurrence_status === AppointmentOccurrenceStatus.upcoming ||
      data.occurrence_status === AppointmentOccurrenceStatus.ongoing) &&
    data.status === AppointmentStatus.approved

  const handleEditStudents = () => navToEditStudents({ appointmentId: data.id })

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'white',
        boxShadow: 1,
        borderRadius: 5,
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
      }}
    >
      <AppointmentBriefCard
        appointmentId={data.id}
        status={data.status}
        begins_at={data.begins_at}
        title={data.school === null ? undefined : data.school.name}
        subject={data.requested_evaluation_subject === null ? '' : data.requested_evaluation_subject.name}
        grade={data.requested_evaluation_grade === null ? undefined : data.requested_evaluation_grade}
        evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
        occurrence_status={data.occurrence_status}
        pin={data.pin}
        comments={data.comments}
      />

      <MagicGrid>
        <Box display="flex" flexDirection="column" gap={2}>
          {canManageStudentsForAppointment && (
            <>
              <Body1>
                Estudiantes: <Bold>{data.student_count}</Bold>
              </Body1>

              {data.student_count === 0 ? (
                <Button fullWidth onClick={handleEditStudents}>
                  Agregar estudiantes
                </Button>
              ) : (
                <Button fullWidth color="secondary" onClick={handleEditStudents}>
                  Editar estudiantes
                </Button>
              )}

              {canReschedule && (
                <Button fullWidth color="info" onClick={() => setOpen(true)}>
                  Reprogramar
                </Button>
              )}
            </>
          )}

          {canViewDetail && (
            <Button fullWidth onClick={() => navToDetail(data.id)}>
              Ver detalle
            </Button>
          )}
        </Box>
      </MagicGrid>

      <RescheduleDialog
        open={open}
        onClose={() => setOpen(false)}
        originalAppointment={data}
        onRescheduled={onRescheduled}
      />
    </Box>
  )
}

export default AppointmentSchoolCard

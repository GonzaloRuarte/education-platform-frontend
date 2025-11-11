import { AppointmentOccurrenceStatus, AppointmentStatus, I_AppointmentSchoolCardItem } from '@/mta_schedule/types'
import { Grid2 } from '@mui/material'

import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { useNavigateToAppointmentDetail, useNavigateToAppointmentEditStudents } from '@/mta_schedule/hooks'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import Box from '@mui/material/Box'
import { Body1 } from '@/shared/components/Typography'
import { useState } from 'react'
import RescheduleDialog from '@/mta_schedule/components/AppointmentRescheduleDialog'


interface I_Props {
  data: I_AppointmentSchoolCardItem
  onRescheduled?: () => void; // ← NEW
  isSchoolStaff?: boolean;
}
const AppointmentSchoolCard = ({ data, onRescheduled, isSchoolStaff }: I_Props) => {
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const handleEditStudents = () => {
    navToEditStudents({ appointmentId: data.id })
  }
  const navToDetail = useNavigateToAppointmentDetail()
  const [open, setOpen] = useState(false)
  return (
    <Grid2
      size={4}
      container
      sx={{ background: 'white' }}
      boxShadow={1}
      borderRadius={5}
      p={3}
      spacing={2}
      flexDirection="column"
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

      {/* Actions */}
      <Grid2 size={12}>
        <MagicGrid>
          <Box display="flex" flexDirection="column" gap={2}>
              {/* Show only when upcoming & approved */}
              {(data.occurrence_status === AppointmentOccurrenceStatus.upcoming || data.occurrence_status === AppointmentOccurrenceStatus.ongoing) &&
                data.status === AppointmentStatus.approved && (
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


                    <Button fullWidth color="info" onClick={() => setOpen(true)}>
                      Reprogramar
                    </Button>
                  </>
              )}
              
              <Button fullWidth onClick={() => navToDetail(data.id)}>
                Ver detalle
              </Button>
            </Box>
          
        </MagicGrid>
          <RescheduleDialog
            open={open}
            onClose={() => setOpen(false)}
            originalAppointment={data}
            onRescheduled={onRescheduled}
        />
        
      </Grid2>
    </Grid2>
  )
}

export default AppointmentSchoolCard

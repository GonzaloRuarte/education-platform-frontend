import { AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { Grid2 } from '@mui/material'

import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { appointmentFormattedStringDate } from '@/mta_schedule/utils'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1 } from '@/shared/components/Typography'
import TodayIcon from '@mui/icons-material/Today'
import { useNavigateToAppointmentEditStudents } from '@/mta_schedule/hooks'

interface I_Props {
  data: I_AppointmentListItem
}
const AppointmentSchoolCard = ({ data }: I_Props) => {
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const handleEditStudents = () => {
    navToEditStudents({ appointmentId: data.id })
  }
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
      {/* Header */}
      <Grid2 container size={12}>
        <Grid2 size={6}>
          <TodayIcon />
        </Grid2>
        <Grid2 size={6} textAlign={'right'}>
          <AppointmentStatusChip status={data.status} />
        </Grid2>
      </Grid2>

      {/* Date */}
      <Grid2 size={'grow'}>
        <Body1>{appointmentFormattedStringDate(data.begins_at)}</Body1>
      </Grid2>

      {/* Actions */}
      <Grid2 size={12}>
        <MagicGrid>
          {data.status === AppointmentStatus.approved && (
            <MagicGrid itemSize="auto">
              <Body1>
                Estudiantes: <Bold>{data.student_count}</Bold>
              </Body1>
              {data.student_count === 0 ? (
                <Button fullWidth color="primary" onClick={handleEditStudents}>
                  Agregar estudiantes
                </Button>
              ) : (
                <Button fullWidth color="secondary" onClick={handleEditStudents}>
                  Editar estudiantes
                </Button>
              )}
            </MagicGrid>
          )}
          <DeleteButton fullWidth color="error" label="Eliminar turno" variant="outlined" disabled />
        </MagicGrid>
      </Grid2>
    </Grid2>
  )
}

export default AppointmentSchoolCard

import { AppointmentOccurrenceStatus, AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { Grid2, Tooltip } from '@mui/material'

import AppointmentOccurrenceStatusChip from '@/mta_schedule/components/AppointmentOccurrenceStatusChip'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { useNavigateToAppointmentDetail, useNavigateToAppointmentEditStudents } from '@/mta_schedule/hooks'
import { appointmentFormattedStringDate } from '@/mta_schedule/utils'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import { Body1 } from '@/shared/components/Typography'
import TodayIcon from '@mui/icons-material/Today'

interface I_Props {
  data: I_AppointmentListItem
}
const AppointmentSchoolCard = ({ data }: I_Props) => {
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const handleEditStudents = () => {
    navToEditStudents({ appointmentId: data.id })
  }
  const navToDetail = useNavigateToAppointmentDetail()
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
        <Grid2 size={3}>
          <Tooltip title={`id: ${data.id}`} placement="right-end">
            <TodayIcon />
          </Tooltip>
        </Grid2>
        <Grid2 size={9}>
          <MagicGrid itemSize="auto" justifyContent={'flex-end'}>
            <AppointmentStatusChip status={data.status} />
            <AppointmentOccurrenceStatusChip status={data.occurrence_status} />
          </MagicGrid>
        </Grid2>
      </Grid2>

      {/* Date */}
      <Grid2 size={'grow'}>
        <Body1>{appointmentFormattedStringDate(data.begins_at)}</Body1>
      </Grid2>
      <Spacer />

      {/* Actions */}
      <Grid2 size={12}>
        <MagicGrid>
          {data.occurrence_status === AppointmentOccurrenceStatus.upcoming && (
            <>
              <>
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
              </>
            </>
          )}

          <Button fullWidth onClick={() => navToDetail(data.id)}>
            Ver detalle
          </Button>
          <DeleteButton fullWidth color="error" label="Eliminar turno" variant="outlined" disabled />
        </MagicGrid>
      </Grid2>
    </Grid2>
  )
}

export default AppointmentSchoolCard

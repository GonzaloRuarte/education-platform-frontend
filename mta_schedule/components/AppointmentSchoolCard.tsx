import { AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { Grid2, Tooltip } from '@mui/material'

import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { appointmentAlreadyStarted, appointmentFormattedStringDate } from '@/mta_schedule/utils'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1 } from '@/shared/components/Typography'
import TodayIcon from '@mui/icons-material/Today'
import { useNavigateToAppointmentDetail, useNavigateToAppointmentEditStudents } from '@/mta_schedule/hooks'
import Chip from '@/shared/components/Chip'
import { grey } from '@mui/material/colors'
import Spacer from '@/shared/components/Spacer'

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
        <Grid2 size={6}>
          <Tooltip title={`id: ${data.id}`} placement="right-end">
            <TodayIcon />
          </Tooltip>
        </Grid2>
        <Grid2 size={6} textAlign={'right'}>
          <AppointmentStatusChip status={data.status} />
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
          {appointmentAlreadyStarted(data.begins_at) ? (
            <Chip label="Turno Pasado" sx={{ background: grey[300], width: '100%' }} />
          ) : (
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
          )}
          <Button fullWidth color="info" onClick={() => navToDetail(data.id)}>
            Ver detalle
          </Button>
          <DeleteButton fullWidth color="error" label="Eliminar turno" variant="outlined" disabled />
        </MagicGrid>
      </Grid2>
    </Grid2>
  )
}

export default AppointmentSchoolCard

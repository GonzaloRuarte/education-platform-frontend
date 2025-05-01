import { AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { Grid2 } from '@mui/material'

import TodayIcon from '@mui/icons-material/Today'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { LIGHT_BG_COLOR } from '@/config'
import { appointmentFormattedStringDate } from '@/mta_schedule/utils'
import { Body1 } from '@/shared/components/Typography'
import MagicGrid from '@/shared/components/MagicGrid'
import Button from '@/shared/components/Button'
import { DeleteButton } from '@/shared/components/buttons'

interface I_Props {
  data: I_AppointmentListItem
}
const AppointmentSchoolCard = ({ data }: I_Props) => {
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
      <Grid2 size={12}>
        <Body1>{appointmentFormattedStringDate(data.begins_at)}</Body1>
      </Grid2>

      {/* Actions */}
      <Grid2 size={12}>
        {data.status === AppointmentStatus.approved && (
          <MagicGrid>
            {data.student_count === 0 ? (
              <Button fullWidth color="primary">
                Agregar estudiantes
              </Button>
            ) : (
              <Button fullWidth color="secondary">
                Editar estudiantes
              </Button>
            )}

            <DeleteButton fullWidth color="error" label="Eliminar turno" />
          </MagicGrid>
        )}
      </Grid2>
    </Grid2>
  )
}

export default AppointmentSchoolCard

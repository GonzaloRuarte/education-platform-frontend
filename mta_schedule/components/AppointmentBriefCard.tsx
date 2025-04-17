import { LIGHT_BG_COLOR } from '@/config'
import { T_AppointmentId } from '@/mta_schedule/types'
import { SchoolGrade } from '@/mta_schools/constants'
import { gradeLabel, schoolLabels } from '@/mta_schools/labels'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1, H4 } from '@/shared/components/Typography'
import { sentence } from '@/shared/utils'
import TodayIcon from '@mui/icons-material/Today'
import { Box } from '@mui/material'
import dayjs from 'dayjs'

interface I_Props {
  title: string
  begins_at: string
  subject?: string
  grade?: SchoolGrade
  appointmentId: T_AppointmentId
}

const AppointmentBriefCard = ({ appointmentId, title, begins_at, subject, grade }: I_Props) => {
  return (
    <Box bgcolor={LIGHT_BG_COLOR} borderRadius={2} padding={2}>
      <TodayIcon />
      <MagicGrid spacing={1}>
        <H4>{title}</H4>
        <MagicGrid itemSize="auto">
          <Body1>{sentence(dayjs(begins_at).locale('es').format('LLLL'))}</Body1>
          <Chip sx={{ opacity: 0.4 }} size="small" label={`ID: ${appointmentId}`} />
        </MagicGrid>
        <MagicGrid itemSize="auto">
          {subject && <Chip size="small" label={subject} color="info" />}
          {grade && <Chip size="small" label={gradeLabel(grade)} color="success" />}
        </MagicGrid>
      </MagicGrid>
    </Box>
  )
}

export default AppointmentBriefCard

import { evaluationLabels } from '@/mta_evaluations/labels'
import Pastilla from '@/shared/components/Pastilla'
import Grid from '@mui/material/Grid2'
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak'
import QuizIcon from '@mui/icons-material/Quiz'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'

const CreationToolbar = () => {
  return (
    <Pastilla>
      <Grid container justifyContent="center" alignItems="center">
        <Grid size="grow">{evaluationLabels.create}</Grid>
        <MagicGrid itemSize={'auto'}>
          <Button startIcon={<InsertPageBreakIcon />}>{evaluationLabels.pageBreak}</Button>
          <Button startIcon={<QuizIcon />}>{evaluationLabels.newQuestion}</Button>
        </MagicGrid>
      </Grid>
    </Pastilla>
  )
}

export default CreationToolbar

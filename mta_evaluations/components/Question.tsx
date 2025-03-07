import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1, Body2 } from '@/shared/components/Typography'
import { sharedLabels } from '@/shared/labels'
import { T_ArrayElement } from '@/shared/types'
import truncateString, { strippedString } from '@/shared/utils'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadIcon from '@mui/icons-material/Upload'
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid2 as Grid } from '@mui/material'
import parse from 'html-react-parser'
import React, { FC } from 'react'

const Question: FC<{
  question: T_ArrayElement<I_EvaluationDetail['questions']>
  isExpanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<number | false>>
}> = ({ isExpanded, setExpanded, question }) => {
  const handleChange = (panel: I_EvaluationDetail['id']) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  return (
    <Accordion style={{ margin: '.5em 0' }} slotProps={{ transition: { unmountOnExit: true } }} expanded={isExpanded} onChange={handleChange(question.id)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Body1 component="span" sx={{ width: '33%', flexShrink: 0 }}>
          Pregunta #{question.order + 1}
        </Body1>
        {!isExpanded && (
          <Body2 component="span" sx={{ color: 'text.secondary' }}>
            {truncateString(strippedString(question.content), 40)}
          </Body2>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <MagicGrid>
          <Box>{parse(question.content)}</Box>
          <Grid container justifyContent="flex-end" alignItems="center">
            <Grid container spacing={2}>
              <Grid>
                <Button startIcon={<DeleteIcon />}>{sharedLabels.delete}</Button>
              </Grid>
              <Grid>
                <Button startIcon={<UploadIcon />}>{sharedLabels.moveUp}</Button>
              </Grid>
              <Grid>
                <Button startIcon={<DownloadIcon />}>{sharedLabels.moveDown}</Button>
              </Grid>
            </Grid>
          </Grid>
        </MagicGrid>
      </AccordionDetails>
    </Accordion>
  )
}

export default Question

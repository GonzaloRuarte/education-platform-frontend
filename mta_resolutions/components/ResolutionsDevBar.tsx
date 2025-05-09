import Chip from '@/shared/components/Chip'
import { secondsToMMSS } from '@/shared/utils'
import { Grid2 as Grid, IconButton } from '@mui/material'
import React from 'react'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useResolutionElapsedTimeSeconds, useResolutionExit } from '@/mta_resolutions/hooks'
import { useTheme } from '@/shared/hooks'

const ResolutionsDevBar = () => {
  const t = useTheme()
  const exit = useResolutionExit()
  const elapsedTimeSeconds = useResolutionElapsedTimeSeconds()

  return (
    <Grid
      container
      alignItems="center"
      bgcolor={t.palette.grey[400]}
      borderRadius={10}
      paddingLeft={1}
      paddingRight={2}
    >
      <Grid>
        <Chip label="Dev" />
      </Grid>
      <Grid>{secondsToMMSS(elapsedTimeSeconds)}</Grid>
      <Grid>
        <IconButton onClick={exit}>
          <ExitToAppIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default ResolutionsDevBar

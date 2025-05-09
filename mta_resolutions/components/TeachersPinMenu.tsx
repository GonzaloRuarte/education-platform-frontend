import { useResolutionAccessibility, useResolutionDownloadState, useResolutionPin } from '@/mta_resolutions/hooks/data'
import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import { H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { useTheme } from '@/shared/hooks'
import { Box, FormControlLabel, FormGroup, Popover, Switch, ToggleButton } from '@mui/material'
import React from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import Spacer from '@/shared/components/Spacer'
import { useResolutionExit } from '@/mta_resolutions/hooks'

const TeachersPinMenu = () => {
  const t = useTheme()
  const pin = useResolutionPin()
  const [inputPin, setInputPinValue] = React.useState<string>('')
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLFormElement | null>(null)
  const { downloadResolutionState } = useResolutionDownloadState()
  const { requiresAccessibility, storeRequiresAccessibility } = useResolutionAccessibility()
  const exit = useResolutionExit()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setAnchorEl(e.currentTarget)
    e.preventDefault()
    if (pin === null) return
    if (inputPin === pin.toString()) {
      setOpen(true)
    }
    setInputPinValue('')
  }
  const handleClose = () => {
    setAnchorEl(null)
    setOpen(false)
  }
  return (
    <Box>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={open}
        onClose={handleClose}
      >
        <Box width={200} p={2} sx={{ width: 230 }}>
          <MagicGrid>
            <H4>Evaluaciones</H4>
            <Button fullWidth startIcon={<DownloadIcon />} size="small" onClick={downloadResolutionState}>
              Descargar Evaluación
            </Button>
            <Button fullWidth size="small" variant="outlined" onClick={exit}>
              Salir de la Evaluación
            </Button>
            <Spacer size="xs" />
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={requiresAccessibility}
                    onChange={(_, c) => {
                      storeRequiresAccessibility(c)
                    }}
                  />
                }
                label="Accesibilidad"
              />
            </FormGroup>
          </MagicGrid>
        </Box>
      </Popover>
      <form onSubmit={handleSubmit}>
        <Input
          name="pin"
          label="PIN"
          placeholder="Ingrese el PIN"
          type="password"
          autoComplete="off"
          size="small"
          value={inputPin}
          sx={{ width: 150 }}
          onChange={(e) => setInputPinValue(e.target.value)}
          slotProps={{
            inputLabel: { sx: { background: t.palette.primary.main, color: 'white !important' } },
            input: { sx: { border: '1px solid rgba(255,255,255,.5) !important', color: 'white !important' } },
          }}
        />
      </form>
    </Box>
  )
}

export default TeachersPinMenu

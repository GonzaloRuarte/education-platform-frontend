'use client'

import { LIGHT_BG_COLOR } from '@/config'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useNavigateToAppointmentHome, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import { BackButton, DeleteButton } from '@/shared/components/buttons'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { Box } from '@mui/material'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const AppointmentUploadOfflineResolutions = () => {
  const [files, setFiles] = React.useState<File[]>([])
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles)
    setFiles(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const t = useTheme()

  const navToAppointmentHome = useNavigateToAppointmentHome()
  return (
    <Page>
      <Page.Title>Cargar {APPOINTMENT_RESOLUTION_PROCESS_NAME.plural} Offline</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={navToAppointmentHome} />
      </Page.Toolbar>
      <Page.Content>
        <Box>
          <div
            style={{
              background: LIGHT_BG_COLOR,
              padding: 20,
              borderRadius: 5,
              border: '4px dashed',
              borderColor: t.palette.primary.main,
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <H4>Arroje los archivos aquí</H4>
            ) : (
              <H4>Arrastre y suelte algunos archivos aquí, o haga clic para seleccionar archivos</H4>
            )}
          </div>
          <Spacer size="l" />
          <H4>Archivos seleccionados:</H4>
          <Spacer />
          <DeleteButton onClick={() => setFiles([])} color="error" />
          <Spacer size="s" />
          <MagicGrid spacing={0}>
            {files.map((file) => (
              <Chip key={file.name} label={file.name} color="primary" variant="outlined" sx={{ margin: 1 }} />
            ))}
          </MagicGrid>
        </Box>
      </Page.Content>
    </Page>
  )
}

export default AppointmentUploadOfflineResolutions
